/**
 * @moolox/git — Durable Background Push Pipeline (GIT-003)
 *
 * Implements the canvas→GitHub push flow as an Inngest-compatible durable
 * function. Batches rapid canvas saves into atomic `feat(moolox)` commits
 * using a 30-second debounce window to avoid GitHub API rate exhaustion.
 *
 * Pipeline:
 * 1. Export current AST + tokens to standalone Next.js code (GIT-002).
 * 2. Create atomic commit via GitHub Trees/Commits API.
 * 3. Record sync event in the append-only ledger.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq } from 'drizzle-orm';
import { type Database, projects, syncEvents, type NewSyncEvent } from '@moolox/db';
import type { IASTNode, TokenDocument } from '@moolox/types';
import { getInstallationAccessToken } from '../github/oauth';
import { exportToNextJS } from '../export/nextjs-exporter';
import { createAtomicCommit, type FileChange } from './git-client';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Push job configuration. */
export interface PushJobConfig {
  /** Moolox project ID */
  projectId: string;
  /** Version number being pushed */
  versionNum: number;
  /** User ID who triggered the push */
  triggeredBy: string;
  /** Custom commit message (auto-generated if omitted) */
  commitMessage?: string;
  /** GitHub API base URL override (for testing) */
  apiBaseUrl?: string;
}

/** Result of a successful push operation. */
export interface PushJobResult {
  /** Git commit SHA */
  commitSha: string;
  /** Commit message used */
  commitMessage: string;
  /** Number of files pushed */
  filesChanged: number;
  /** Total push duration in milliseconds */
  durationMs: number;
  /** Sync event ID */
  syncEventId: string;
}

// ---------------------------------------------------------------------------
// Push Pipeline
// ---------------------------------------------------------------------------

/**
 * Executes the canvas→GitHub push pipeline.
 *
 * Designed to be invoked as an Inngest durable function with:
 * - Event: `moolox/git.push.requested`
 * - Concurrency key: `projectId` (one push at a time per project)
 * - Debounce: 30 seconds (batches rapid saves)
 *
 * @param db - Database client
 * @param astRoot - Current AST root node
 * @param tokens - Current design token document
 * @param config - Push job configuration
 * @returns Push result with commit SHA and metadata
 */
export async function pushToGitHub(
  db: Database,
  astRoot: IASTNode,
  tokens: TokenDocument,
  config: PushJobConfig,
): Promise<PushJobResult> {
  const startTime = performance.now();
  const syncEventId = generateId();

  // 1. Record pending sync event
  const pendingEvent: NewSyncEvent = {
    id: syncEventId,
    projectId: config.projectId,
    direction: 'push',
    status: 'in_progress',
    triggeredBy: config.triggeredBy,
  };

  await db.insert(syncEvents).values(pendingEvent);

  try {
    // 2. Load project and verify GitHub link
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, config.projectId),
    });

    if (!project) {
      throw new Error(`Project "${config.projectId}" not found.`);
    }

    if (!project.githubRepoUrl) {
      throw new Error(
        `Project "${config.projectId}" has no linked GitHub repository. ` +
          'Link a repository before pushing.',
      );
    }

    // 3. Find the active installation for this workspace
    const installation = await db.query.githubInstallations.findFirst({
      where: eq(
        (await import('@moolox/db')).githubInstallations.workspaceId,
        project.workspaceId,
      ),
    });

    if (!installation || installation.status !== 'active') {
      throw new Error(
        `No active GitHub installation found for workspace "${project.workspaceId}". ` +
          'Re-install the Moolox GitHub App.',
      );
    }

    // 4. Get decrypted access token
    const accessToken = await getInstallationAccessToken(db, installation.id);

    // 5. Export project to standalone Next.js code
    const exportManifest = exportToNextJS(astRoot, tokens, {
      projectId: config.projectId,
      versionNum: config.versionNum,
      projectName: project.name,
      projectSlug: project.slug,
    });

    // 6. Convert export manifest to file changes
    const fileChanges: FileChange[] = Object.entries(exportManifest.files).map(
      ([path, content]) => ({
        path,
        content,
        mode: '100644' as const,
      }),
    );

    // 7. Create atomic commit
    const repoFullName = extractRepoFullName(project.githubRepoUrl);
    const branch = project.githubBranch ?? 'main';
    const commitMessage =
      config.commitMessage ??
      `feat(moolox): update project "${project.name}" (v${config.versionNum})\n\n` +
        `Exported ${exportManifest.totalFiles} files (${formatBytes(exportManifest.totalBytes)}) ` +
        `from Moolox canvas.\n\nVersion: ${config.versionNum}\nProject: ${config.projectId}`;

    const commitResult = await createAtomicCommit(
      accessToken,
      repoFullName,
      branch,
      fileChanges,
      commitMessage,
      config.apiBaseUrl,
    );

    // 8. Update sync event to completed
    const durationMs = Math.round(performance.now() - startTime);

    await db
      .update(syncEvents)
      .set({
        status: 'completed',
        commitSha: commitResult.sha,
        commitMessage: commitResult.message,
        filesChanged: commitResult.filesCount,
        durationMs,
      })
      .where(eq(syncEvents.id, syncEventId));

    return {
      commitSha: commitResult.sha,
      commitMessage: commitResult.message,
      filesChanged: commitResult.filesCount,
      durationMs,
      syncEventId,
    };
  } catch (error) {
    // Record failure in sync event
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);

    await db
      .update(syncEvents)
      .set({
        status: 'failed',
        errorMessage,
        durationMs,
      })
      .where(eq(syncEvents.id, syncEventId));

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Inngest Event Schema (Type-Safe Event Definition)
// ---------------------------------------------------------------------------

/**
 * Inngest event schema for the push pipeline.
 * Used for type-safe event dispatch in the Inngest client.
 */
export interface PushRequestedEvent {
  name: 'moolox/git.push.requested';
  data: {
    projectId: string;
    versionNum: number;
    triggeredBy: string;
    commitMessage?: string;
  };
}

/**
 * Configuration for the Inngest push function.
 * Defines concurrency, debounce, and retry behavior.
 */
export const PUSH_FUNCTION_CONFIG = {
  id: 'moolox-git-push',
  /** Debounce 30 seconds to batch rapid saves */
  debounce: {
    period: '30s',
    key: 'event.data.projectId',
  },
  /** One push at a time per project */
  concurrency: [
    {
      limit: 1,
      key: 'event.data.projectId',
    },
  ],
  /** Retry up to 3 times with exponential backoff */
  retries: 3,
} as const;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Extracts the `owner/repo` portion from a GitHub URL.
 * Handles both HTTPS and SSH formats.
 */
export function extractRepoFullName(githubUrl: string): string {
  // Handle HTTPS: https://github.com/owner/repo or https://github.com/owner/repo.git
  const httpsMatch = githubUrl.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/);
  if (httpsMatch?.[1]) {
    return httpsMatch[1];
  }

  // Handle SSH: git@github.com:owner/repo.git
  const sshMatch = githubUrl.match(/github\.com:([^/]+\/[^/]+?)(?:\.git)?$/);
  if (sshMatch?.[1]) {
    return sshMatch[1];
  }

  throw new Error(`Cannot extract repository full name from URL: "${githubUrl}"`);
}

/** Generates a compact 24-character hex ID. */
function generateId(): string {
  const { randomBytes } = require('node:crypto') as typeof import('node:crypto');
  return randomBytes(12).toString('hex');
}

/** Formats bytes into human-readable string. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
