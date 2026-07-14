/**
 * @moolox/git — GitHub App Installation OAuth & Token Exchange (AUTH-007)
 *
 * Handles the complete GitHub App installation lifecycle:
 * 1. Installation callback processing from GitHub App setup URL redirect.
 * 2. Installation access token generation via JWT → POST /app/installations/:id/access_tokens.
 * 3. Encrypted credential persistence with key-version rotation hooks.
 * 4. Installation suspension/uninstallation handling.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq } from 'drizzle-orm';
import {
  type Database,
  githubInstallations,
  githubCredentials,
  type NewGitHubInstallation,
} from '@moolox/db';
import { encryptToken, decryptToken, getCurrentKeyVersion, CredentialCryptoError } from './credentials';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** GitHub App configuration sourced from environment variables. */
export interface GitHubAppConfig {
  /** GitHub App ID */
  appId: string;
  /** GitHub App private key (PEM format) for JWT signing */
  privateKey: string;
  /** GitHub App webhook secret for HMAC verification */
  webhookSecret: string;
  /** GitHub App client ID (for OAuth web flow, if needed) */
  clientId: string;
  /** Base URL for GitHub API (defaults to https://api.github.com) */
  apiBaseUrl: string;
}

/**
 * Resolves GitHub App configuration from environment variables.
 * Throws if required configuration is missing.
 */
export function getGitHubAppConfig(): GitHubAppConfig {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  const clientId = process.env.GITHUB_APP_CLIENT_ID;

  if (!appId || !privateKey || !webhookSecret || !clientId) {
    throw new Error(
      'Missing GitHub App configuration. Required environment variables: ' +
        'GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET, GITHUB_APP_CLIENT_ID',
    );
  }

  return {
    appId,
    privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines in env vars
    webhookSecret,
    clientId,
    apiBaseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
  };
}

// ---------------------------------------------------------------------------
// JWT Generation for GitHub App Authentication
// ---------------------------------------------------------------------------

/**
 * Generates a JWT for authenticating as the GitHub App itself.
 * Used to request installation access tokens.
 *
 * JWT structure per GitHub docs:
 * - Header: { alg: "RS256", typ: "JWT" }
 * - Payload: { iat, exp (10 min max), iss: appId }
 * - Signed with App's RSA private key
 */
export async function generateAppJWT(config: GitHubAppConfig): Promise<string> {
  const { createSign } = await import('node:crypto');

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iat: now - 60, // 60 seconds clock skew allowance
      exp: now + 600, // 10 minutes maximum
      iss: config.appId,
    }),
  );

  const signingInput = `${header}.${payload}`;
  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  sign.end();

  const signature = sign.sign(config.privateKey);
  const encodedSignature = signature
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${signingInput}.${encodedSignature}`;
}

// ---------------------------------------------------------------------------
// Installation Access Token Exchange
// ---------------------------------------------------------------------------

/** Result of requesting a GitHub installation access token. */
export interface InstallationTokenResult {
  /** The access token for API requests */
  token: string;
  /** ISO 8601 expiry timestamp */
  expiresAt: string;
  /** Permissions granted */
  permissions: Record<string, string>;
  /** Repository selection type */
  repositorySelection: string;
}

/**
 * Requests a new installation access token from GitHub's API.
 *
 * POST /app/installations/{installation_id}/access_tokens
 * Authenticated via App JWT.
 */
export async function requestInstallationToken(
  githubInstallationId: number,
  config: GitHubAppConfig,
): Promise<InstallationTokenResult> {
  const jwt = await generateAppJWT(config);

  const response = await fetch(
    `${config.apiBaseUrl}/app/installations/${githubInstallationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `GitHub API error (${response.status}) requesting installation token for ` +
        `installation ${githubInstallationId}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as {
    token: string;
    expires_at: string;
    permissions?: Record<string, string>;
    repository_selection?: string;
  };

  return {
    token: data.token,
    expiresAt: data.expires_at,
    permissions: data.permissions ?? {},
    repositorySelection: data.repository_selection ?? 'selected',
  };
}

// ---------------------------------------------------------------------------
// Installation Callback Handler
// ---------------------------------------------------------------------------

/** Parameters from the GitHub App installation callback URL. */
export interface InstallationCallbackParams {
  /** GitHub installation ID from the callback query parameter */
  installationId: number;
  /** GitHub account login (org or user) */
  accountLogin: string;
  /** GitHub account type */
  accountType: 'Organization' | 'User';
  /** GitHub account numeric ID */
  accountId: number;
  /** Permissions granted during installation */
  permissions: Record<string, string>;
  /** Repository selection type */
  repositorySelection: 'all' | 'selected';
}

/**
 * Processes a GitHub App installation callback.
 *
 * 1. Persists the installation record linked to the workspace.
 * 2. Requests an installation access token from GitHub.
 * 3. Encrypts and stores the token using AES-256-GCM.
 *
 * @param db - Database client
 * @param workspaceId - Moolox workspace to link the installation to
 * @param params - Installation parameters from the callback
 * @param config - GitHub App configuration
 * @returns The created installation record ID
 */
export async function handleInstallationCallback(
  db: Database,
  workspaceId: string,
  params: InstallationCallbackParams,
  config?: GitHubAppConfig,
): Promise<{ installationId: string; githubInstallationId: number }> {
  const resolvedConfig = config ?? getGitHubAppConfig();
  const internalId = generateId();

  // 1. Check for existing installation for this GitHub installation ID
  const existing = await db.query.githubInstallations.findFirst({
    where: eq(githubInstallations.githubInstallationId, params.installationId),
  });

  if (existing) {
    // Re-activation: update status to active and re-link to workspace
    await db
      .update(githubInstallations)
      .set({
        status: 'active',
        workspaceId,
        permissions: params.permissions,
        repositorySelection: params.repositorySelection,
      })
      .where(eq(githubInstallations.id, existing.id));

    // Refresh the access token
    await refreshAndStoreToken(db, existing.id, params.installationId, resolvedConfig);

    return { installationId: existing.id, githubInstallationId: params.installationId };
  }

  // 2. Create new installation record
  const installationRecord: NewGitHubInstallation = {
    id: internalId,
    workspaceId,
    githubInstallationId: params.installationId,
    githubAccountLogin: params.accountLogin,
    githubAccountType: params.accountType,
    githubAccountId: params.accountId,
    status: 'active',
    permissions: params.permissions,
    repositorySelection: params.repositorySelection,
  };

  await db.insert(githubInstallations).values(installationRecord);

  // 3. Request and encrypt access token
  await refreshAndStoreToken(db, internalId, params.installationId, resolvedConfig);

  return { installationId: internalId, githubInstallationId: params.installationId };
}

// ---------------------------------------------------------------------------
// Token Refresh & Storage
// ---------------------------------------------------------------------------

/**
 * Requests a fresh installation token from GitHub, encrypts it,
 * and upserts it into the github_credentials table.
 */
export async function refreshAndStoreToken(
  db: Database,
  internalInstallationId: string,
  githubInstallationId: number,
  config: GitHubAppConfig,
): Promise<void> {
  const tokenResult = await requestInstallationToken(githubInstallationId, config);

  const encrypted = encryptToken(tokenResult.token);

  // Upsert: insert or replace existing credential
  const existingCred = await db.query.githubCredentials.findFirst({
    where: eq(githubCredentials.installationId, internalInstallationId),
  });

  if (existingCred) {
    await db
      .update(githubCredentials)
      .set({
        encryptedToken: encrypted.encryptedToken,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: encrypted.keyVersion,
        expiresAt: new Date(tokenResult.expiresAt),
        updatedAt: new Date(),
      })
      .where(eq(githubCredentials.installationId, internalInstallationId));
  } else {
    await db.insert(githubCredentials).values({
      installationId: internalInstallationId,
      encryptedToken: encrypted.encryptedToken,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: encrypted.keyVersion,
      expiresAt: new Date(tokenResult.expiresAt),
    });
  }
}

/**
 * Retrieves and decrypts the current access token for a GitHub installation.
 * Automatically refreshes the token if it has expired or is within 5 minutes
 * of expiry.
 */
export async function getInstallationAccessToken(
  db: Database,
  internalInstallationId: string,
  config?: GitHubAppConfig,
): Promise<string> {
  const installation = await db.query.githubInstallations.findFirst({
    where: eq(githubInstallations.id, internalInstallationId),
  });

  if (!installation) {
    throw new Error(`GitHub installation "${internalInstallationId}" not found.`);
  }

  if (installation.status !== 'active') {
    throw new Error(
      `GitHub installation "${internalInstallationId}" is ${installation.status}. ` +
        'Cannot retrieve access token for non-active installations.',
    );
  }

  const credential = await db.query.githubCredentials.findFirst({
    where: eq(githubCredentials.installationId, internalInstallationId),
  });

  if (!credential) {
    throw new Error(
      `No credential found for installation "${internalInstallationId}". ` +
        'Re-run the installation callback to provision a new token.',
    );
  }

  // Check expiry with 5-minute safety margin
  const expiresAt = new Date(credential.expiresAt).getTime();
  const safetyMarginMs = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();

  if (expiresAt - now < safetyMarginMs) {
    // Token expired or about to expire — refresh
    const resolvedConfig = config ?? getGitHubAppConfig();
    await refreshAndStoreToken(
      db,
      internalInstallationId,
      installation.githubInstallationId,
      resolvedConfig,
    );

    // Re-read the refreshed credential
    const refreshed = await db.query.githubCredentials.findFirst({
      where: eq(githubCredentials.installationId, internalInstallationId),
    });

    if (!refreshed) {
      throw new Error('Failed to retrieve refreshed credential after token rotation.');
    }

    return decryptToken(
      refreshed.encryptedToken,
      refreshed.iv,
      refreshed.authTag,
      refreshed.keyVersion,
    );
  }

  return decryptToken(
    credential.encryptedToken,
    credential.iv,
    credential.authTag,
    credential.keyVersion,
  );
}

// ---------------------------------------------------------------------------
// Installation Lifecycle Management
// ---------------------------------------------------------------------------

/**
 * Handles GitHub App installation suspension.
 * Updates the installation status to 'suspended'.
 */
export async function handleInstallationSuspended(
  db: Database,
  githubInstallationId: number,
): Promise<void> {
  await db
    .update(githubInstallations)
    .set({ status: 'suspended' })
    .where(eq(githubInstallations.githubInstallationId, githubInstallationId));
}

/**
 * Handles GitHub App installation uninstallation (deletion).
 * Updates the installation status to 'uninstalled' (soft delete for audit).
 */
export async function handleInstallationDeleted(
  db: Database,
  githubInstallationId: number,
): Promise<void> {
  await db
    .update(githubInstallations)
    .set({ status: 'uninstalled' })
    .where(eq(githubInstallations.githubInstallationId, githubInstallationId));
}

/**
 * Handles GitHub App installation unsuspension (re-activation).
 */
export async function handleInstallationUnsuspended(
  db: Database,
  githubInstallationId: number,
): Promise<void> {
  await db
    .update(githubInstallations)
    .set({ status: 'active' })
    .where(eq(githubInstallations.githubInstallationId, githubInstallationId));
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Base64-URL encodes a string (no padding). */
function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Generates a compact 24-character hex ID. */
function generateId(): string {
  const { randomBytes: rb } = require('node:crypto') as typeof import('node:crypto');
  return rb(12).toString('hex');
}

export { CredentialCryptoError };
