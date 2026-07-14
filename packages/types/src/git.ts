/**
 * @moolox/types — GitHub Integration Domain Types
 *
 * Feature IDs: AUTH-007, GIT-001, GIT-002, GIT-003, GIT-004
 *
 * Cross-cutting type contracts for GitHub App installations, encrypted
 * credential lifecycle, repository linking, bidirectional sync events,
 * and standalone code export manifests.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// GitHub Installation Status
// ---------------------------------------------------------------------------

/** Lifecycle status of a GitHub App installation within a Moolox workspace. */
export const GitHubInstallationStatusSchema = z.enum([
  'pending',
  'active',
  'suspended',
  'uninstalled',
]);

export type GitHubInstallationStatus = z.infer<typeof GitHubInstallationStatusSchema>;

// ---------------------------------------------------------------------------
// GitHub Installation Record
// ---------------------------------------------------------------------------

/** Persisted GitHub App installation linked to a Moolox workspace. */
export const GitHubInstallationSchema = z.object({
  /** Internal Moolox record ID */
  id: z.string().min(1),
  /** Workspace that owns this installation */
  workspaceId: z.string().min(1),
  /** GitHub's numeric installation ID from the App webhook */
  githubInstallationId: z.number().int().positive(),
  /** GitHub account login (org or user) that installed the App */
  githubAccountLogin: z.string().min(1),
  /** GitHub account type */
  githubAccountType: z.enum(['Organization', 'User']),
  /** GitHub account's numeric ID */
  githubAccountId: z.number().int().positive(),
  /** Installation lifecycle status */
  status: GitHubInstallationStatusSchema,
  /** Permissions granted to the installation (e.g., { contents: 'write', metadata: 'read' }) */
  permissions: z.record(z.string(), z.string()),
  /** Repository selection type */
  repositorySelection: z.enum(['all', 'selected']),
  /** ISO 8601 timestamp of installation */
  installedAt: z.string().datetime(),
});

export type IGitHubInstallation = z.infer<typeof GitHubInstallationSchema>;

// ---------------------------------------------------------------------------
// Encrypted Credential Record (SEC-002 Hook)
// ---------------------------------------------------------------------------

/** Key version identifier for credential rotation lifecycle. */
export const CredentialKeyVersionSchema = z.number().int().positive();

/**
 * Encrypted GitHub credential stored in the database.
 * The token itself is AES-256-GCM encrypted; `keyVersion` enables
 * transparent rotation without re-encryption downtime.
 */
export const EncryptedCredentialSchema = z.object({
  /** Foreign key: installation ID this credential belongs to */
  installationId: z.string().min(1),
  /** AES-256-GCM encrypted access token (base64-encoded ciphertext) */
  encryptedToken: z.string().min(1),
  /** AES-256-GCM initialization vector (base64-encoded) */
  iv: z.string().min(1),
  /** AES-256-GCM authentication tag (base64-encoded) */
  authTag: z.string().min(1),
  /** Encryption key version for rotation lifecycle (`SEC-002` hook) */
  keyVersion: CredentialKeyVersionSchema,
  /** ISO 8601 expiry timestamp of the underlying GitHub token */
  expiresAt: z.string().datetime(),
});

export type IEncryptedCredential = z.infer<typeof EncryptedCredentialSchema>;

// ---------------------------------------------------------------------------
// Repository Link
// ---------------------------------------------------------------------------

/** Association between a Moolox project and a GitHub repository. */
export const RepositoryLinkSchema = z.object({
  /** Moolox project ID */
  projectId: z.string().min(1),
  /** GitHub installation ID (FK to github_installations) */
  installationId: z.string().min(1),
  /** Full GitHub repository name (e.g., `org/repo-name`) */
  githubFullName: z.string().min(1).regex(/^[^/]+\/[^/]+$/),
  /** GitHub's numeric repository ID */
  githubRepoId: z.number().int().positive(),
  /** Target branch for sync (defaults to `main`) */
  branch: z.string().min(1).default('main'),
  /** Base path within the repository for exported code (defaults to root) */
  basePath: z.string().default(''),
  /** Whether auto-push on canvas save is enabled */
  autoPushEnabled: z.boolean().default(false),
  /** Whether incoming webhook sync is enabled */
  autoSyncEnabled: z.boolean().default(true),
});

export type IRepositoryLink = z.infer<typeof RepositoryLinkSchema>;

// ---------------------------------------------------------------------------
// Sync Direction & Events
// ---------------------------------------------------------------------------

/** Direction of a GitHub synchronization event. */
export const SyncDirectionSchema = z.enum(['push', 'pull']);

export type SyncDirection = z.infer<typeof SyncDirectionSchema>;

/** Status of a sync operation. */
export const SyncStatusSchema = z.enum([
  'queued',
  'in_progress',
  'completed',
  'failed',
  'conflict',
]);

export type SyncStatus = z.infer<typeof SyncStatusSchema>;

/** Record of a bidirectional sync event for audit and debugging. */
export const SyncEventSchema = z.object({
  /** Internal event ID */
  id: z.string().min(1),
  /** Project this sync event belongs to */
  projectId: z.string().min(1),
  /** Direction of sync */
  direction: SyncDirectionSchema,
  /** Current status */
  status: SyncStatusSchema,
  /** Git commit SHA (set after push completes or pull processes) */
  commitSha: z.string().optional(),
  /** Commit message */
  commitMessage: z.string().optional(),
  /** Number of files changed in this sync */
  filesChanged: z.number().int().nonnegative().default(0),
  /** Duration of the sync operation in milliseconds */
  durationMs: z.number().int().nonnegative().optional(),
  /** Error message if sync failed */
  errorMessage: z.string().optional(),
  /** Actor who triggered the sync */
  triggeredBy: z.string().min(1),
  /** ISO 8601 timestamp */
  createdAt: z.string().datetime(),
});

export type ISyncEvent = z.infer<typeof SyncEventSchema>;

// ---------------------------------------------------------------------------
// Code Export Manifest (GIT-002)
// ---------------------------------------------------------------------------

/** Manifest describing a standalone Next.js code export. */
export const CodeExportManifestSchema = z.object({
  /** Project ID that was exported */
  projectId: z.string().min(1),
  /** Version number that was exported */
  versionNum: z.number().int().positive(),
  /** Map of relative file paths to file contents */
  files: z.record(z.string(), z.string()),
  /** Total files in the export */
  totalFiles: z.number().int().positive(),
  /** Total bytes across all files */
  totalBytes: z.number().int().nonnegative(),
  /** Export generation duration in milliseconds */
  generationMs: z.number().int().nonnegative(),
});

export type ICodeExportManifest = z.infer<typeof CodeExportManifestSchema>;

// ---------------------------------------------------------------------------
// GitHub Webhook Payload Subset (GIT-004)
// ---------------------------------------------------------------------------

/** Minimal typed contract for the GitHub `push` webhook payload. */
export const GitHubPushPayloadSchema = z.object({
  ref: z.string().min(1),
  before: z.string().min(1),
  after: z.string().min(1),
  repository: z.object({
    id: z.number().int().positive(),
    full_name: z.string().min(1),
    default_branch: z.string().min(1),
  }),
  pusher: z.object({
    name: z.string().min(1),
    email: z.string().optional(),
  }),
  commits: z.array(
    z.object({
      id: z.string().min(1),
      message: z.string(),
      added: z.array(z.string()),
      removed: z.array(z.string()),
      modified: z.array(z.string()),
    }),
  ),
  installation: z
    .object({
      id: z.number().int().positive(),
    })
    .optional(),
});

export type IGitHubPushPayload = z.infer<typeof GitHubPushPayloadSchema>;

// ---------------------------------------------------------------------------
// GitHub API Types
// ---------------------------------------------------------------------------

/** GitHub installation access token response. */
export const GitHubAccessTokenResponseSchema = z.object({
  token: z.string().min(1),
  expires_at: z.string().datetime(),
  permissions: z.record(z.string(), z.string()).optional(),
  repository_selection: z.enum(['all', 'selected']).optional(),
});

export type IGitHubAccessTokenResponse = z.infer<typeof GitHubAccessTokenResponseSchema>;
