/**
 * @moolox/git — Incoming GitHub Webhook Pull Handler (GIT-004)
 *
 * Processes incoming GitHub `push` webhooks and synchronizes code changes
 * back into the Moolox canvas AST. Pipeline:
 *
 * 1. Verify HMAC-SHA256 signature.
 * 2. Filter relevant commits (skip Moolox-originated `feat(moolox)` commits).
 * 3. Fetch changed TSX/CSS files from GitHub.
 * 4. Parse TSX files via SWC parser back into IASTNode trees.
 * 5. Merge changes into the project's active version.
 * 6. Record sync event in the append-only ledger.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq, and } from 'drizzle-orm';
import {
  type Database,
  projects,
  projectVersions,
  syncEvents,
  githubInstallations,
  type NewSyncEvent,
} from '@moolox/db';
import type { IGitHubPushPayload, IASTNode } from '@moolox/types';
import { GitHubPushPayloadSchema } from '@moolox/types';
import { parseJSX } from '@moolox/ast-core';
import { verifyWebhookSignature } from './webhook-verify';
import { getInstallationAccessToken } from '../github/oauth';
import { getFileContent } from './git-client';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Prefix used by Moolox push commits to prevent feedback loops. */
const MOOLOX_COMMIT_PREFIX = 'feat(moolox)' as const;

/** File extensions that trigger AST re-parsing on incoming webhook. */
const PARSEABLE_EXTENSIONS = new Set(['.tsx', '.jsx', '.ts', '.js']);

/** Maximum number of files to process per webhook (rate limit guard). */
const MAX_FILES_PER_WEBHOOK = 50;

// ---------------------------------------------------------------------------
// Webhook Handler
// ---------------------------------------------------------------------------

/** Result of processing an incoming webhook. */
export interface WebhookPullResult {
  /** Whether changes were applied to the canvas AST */
  changesApplied: boolean;
  /** Number of files processed */
  filesProcessed: number;
  /** Sync event ID */
  syncEventId: string;
  /** Total duration in milliseconds */
  durationMs: number;
  /** Reason if no changes were applied */
  skipReason?: string;
}

/**
 * Processes an incoming GitHub `push` webhook.
 *
 * @param db - Database client
 * @param rawPayload - Raw webhook body string (for signature verification)
 * @param signature - Value of the `x-hub-signature-256` header
 * @param webhookSecret - GitHub webhook secret for verification
 * @returns Processing result
 */
export async function handlePushWebhook(
  db: Database,
  rawPayload: string,
  signature: string,
  webhookSecret: string,
): Promise<WebhookPullResult> {
  const startTime = performance.now();

  // 1. Verify webhook signature
  verifyWebhookSignature(rawPayload, signature, webhookSecret);

  // 2. Parse and validate payload
  const payload = GitHubPushPayloadSchema.parse(JSON.parse(rawPayload));

  // 3. Extract branch name from ref
  const branch = extractBranchFromRef(payload.ref);

  // 4. Find the linked project for this repository + branch
  const repoFullName = payload.repository.full_name;
  const githubUrl = `https://github.com/${repoFullName}`;

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.githubRepoUrl, githubUrl),
      eq(projects.githubBranch, branch),
    ),
  });

  if (!project) {
    return {
      changesApplied: false,
      filesProcessed: 0,
      syncEventId: '',
      durationMs: Math.round(performance.now() - startTime),
      skipReason: `No Moolox project linked to ${repoFullName}@${branch}.`,
    };
  }

  // 5. Filter out Moolox-originated commits to prevent feedback loops
  const relevantCommits = payload.commits.filter(
    (commit) => !commit.message.startsWith(MOOLOX_COMMIT_PREFIX),
  );

  if (relevantCommits.length === 0) {
    return {
      changesApplied: false,
      filesProcessed: 0,
      syncEventId: '',
      durationMs: Math.round(performance.now() - startTime),
      skipReason: 'All commits originated from Moolox (feedback loop prevention).',
    };
  }

  // 6. Collect unique changed files across all relevant commits
  const changedFiles = collectChangedFiles(relevantCommits);

  // Filter to only parseable files and apply rate limit guard
  const parseableFiles = changedFiles
    .filter((f) => {
      const ext = f.path.substring(f.path.lastIndexOf('.'));
      return PARSEABLE_EXTENSIONS.has(ext);
    })
    .slice(0, MAX_FILES_PER_WEBHOOK);

  if (parseableFiles.length === 0) {
    return {
      changesApplied: false,
      filesProcessed: 0,
      syncEventId: '',
      durationMs: Math.round(performance.now() - startTime),
      skipReason: 'No parseable TSX/JSX files changed in the push.',
    };
  }

  // 7. Record pending sync event
  const syncEventId = generateId();
  const pendingEvent: NewSyncEvent = {
    id: syncEventId,
    projectId: project.id,
    direction: 'pull',
    status: 'in_progress',
    commitSha: payload.after,
    commitMessage: relevantCommits[0]?.message ?? '',
    triggeredBy: 'webhook',
  };

  await db.insert(syncEvents).values(pendingEvent);

  try {
    // 8. Find the installation for this workspace
    const installation = await db.query.githubInstallations.findFirst({
      where: and(
        eq(githubInstallations.workspaceId, project.workspaceId),
        eq(githubInstallations.status, 'active'),
      ),
    });

    if (!installation) {
      throw new Error(
        `No active GitHub installation found for workspace "${project.workspaceId}".`,
      );
    }

    // 9. Get access token and fetch changed file contents
    const accessToken = await getInstallationAccessToken(db, installation.id);

    const parsedNodes: IASTNode[] = [];
    let filesProcessed = 0;

    for (const file of parseableFiles) {
      if (file.changeType === 'removed') {
        filesProcessed++;
        continue; // Skip deleted files
      }

      const content = await getFileContent(
        accessToken,
        repoFullName,
        file.path,
        branch,
      );

      if (content) {
        try {
          const astNode = parseJSX(content);
          parsedNodes.push(astNode);
          filesProcessed++;
        } catch {
          // Skip files that fail to parse (may not be valid JSX)
          filesProcessed++;
        }
      }
    }

    // 10. If we parsed any nodes, create a new project version
    if (parsedNodes.length > 0) {
      const activeVersion = project.activeVersionId
        ? await db.query.projectVersions.findFirst({
            where: eq(projectVersions.id, project.activeVersionId),
          })
        : null;

      // Merge parsed nodes into the existing AST tree
      // For now, use the first parsed node as the primary page component
      // Future: intelligent merge with conflict detection (GIT-005)
      const mergedAst = parsedNodes[0]!;

      if (activeVersion) {
        const newVersionNum = activeVersion.versionNum + 1;
        const newVersionId = generateId();

        await db.insert(projectVersions).values({
          id: newVersionId,
          projectId: project.id,
          versionNum: newVersionNum,
          name: `GitHub Sync: ${payload.after.slice(0, 7)}`,
          astTree: mergedAst,
          tokensJson: activeVersion.tokensJson,
          createdBy: null, // Webhook-triggered, no specific user
        });

        await db
          .update(projects)
          .set({
            activeVersionId: newVersionId,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, project.id));
      }
    }

    // 11. Update sync event to completed
    const durationMs = Math.round(performance.now() - startTime);

    await db
      .update(syncEvents)
      .set({
        status: 'completed',
        filesChanged: filesProcessed,
        durationMs,
      })
      .where(eq(syncEvents.id, syncEventId));

    return {
      changesApplied: parsedNodes.length > 0,
      filesProcessed,
      syncEventId,
      durationMs,
    };
  } catch (error) {
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
// Utilities
// ---------------------------------------------------------------------------

/** Extracts branch name from a git ref string (e.g., `refs/heads/main` → `main`). */
function extractBranchFromRef(ref: string): string {
  const prefix = 'refs/heads/';
  if (ref.startsWith(prefix)) {
    return ref.slice(prefix.length);
  }
  return ref;
}

/** Represents a changed file with its change type. */
interface ChangedFile {
  path: string;
  changeType: 'added' | 'modified' | 'removed';
}

/**
 * Collects unique changed files across multiple commits,
 * deduplicating by file path (last change wins).
 */
function collectChangedFiles(
  commits: IGitHubPushPayload['commits'],
): ChangedFile[] {
  const fileMap = new Map<string, ChangedFile>();

  for (const commit of commits) {
    for (const path of commit.added) {
      fileMap.set(path, { path, changeType: 'added' });
    }
    for (const path of commit.modified) {
      fileMap.set(path, { path, changeType: 'modified' });
    }
    for (const path of commit.removed) {
      fileMap.set(path, { path, changeType: 'removed' });
    }
  }

  return Array.from(fileMap.values());
}

/** Generates a compact 24-character hex ID. */
function generateId(): string {
  const { randomBytes } = require('node:crypto') as typeof import('node:crypto');
  return randomBytes(12).toString('hex');
}
