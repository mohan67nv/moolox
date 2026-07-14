/**
 * @moolox/git — Bidirectional GitHub Monorepo Synchronization
 *
 * Feature IDs: AUTH-007, GIT-001, GIT-002, GIT-003, GIT-004
 *
 * Provides GitHub App installation authorization, encrypted credential
 * lifecycle, repository provisioning & linking, standalone Next.js code
 * export, durable background push, and incoming webhook pull sync.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

// GitHub App OAuth & Installation (AUTH-007)
export {
  getGitHubAppConfig,
  generateAppJWT,
  requestInstallationToken,
  handleInstallationCallback,
  refreshAndStoreToken,
  getInstallationAccessToken,
  handleInstallationSuspended,
  handleInstallationDeleted,
  handleInstallationUnsuspended,
} from './github/oauth';

export type {
  GitHubAppConfig,
  InstallationCallbackParams,
  InstallationTokenResult,
} from './github/oauth';

// Credential Encryption (AUTH-007, SEC-002)
export {
  encryptToken,
  decryptToken,
  getEncryptionKey,
  getCurrentKeyVersion,
  CredentialCryptoError,
} from './github/credentials';

export type { EncryptedTokenResult } from './github/credentials';

// Repository Provisioning & Linking (GIT-001)
export {
  listInstallationRepositories,
  linkRepository,
  unlinkRepository,
  getRepositoryLinkStatus,
} from './github/repository';

export type {
  GitHubRepository,
  LinkRepositoryInput,
  LinkRepositoryResult,
} from './github/repository';

// Standalone Next.js Code Exporter (GIT-002)
export { exportToNextJS } from './export/nextjs-exporter';

export type { NextJSExportOptions } from './export/nextjs-exporter';

// Git API Client (GIT-003)
export {
  createAtomicCommit,
  getFileContent,
  getCommitFiles,
} from './sync/git-client';

export type { FileChange, CommitResult } from './sync/git-client';

// Durable Background Push (GIT-003)
export {
  pushToGitHub,
  extractRepoFullName,
  PUSH_FUNCTION_CONFIG,
} from './sync/push';

export type {
  PushJobConfig,
  PushJobResult,
  PushRequestedEvent,
} from './sync/push';

// Webhook Verification (GIT-004)
export {
  verifyWebhookSignature,
  WebhookSignatureError,
} from './sync/webhook-verify';

// Incoming Webhook Pull (GIT-004)
export { handlePushWebhook } from './sync/webhook-pull';

export type { WebhookPullResult } from './sync/webhook-pull';
