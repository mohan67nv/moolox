/**
 * @moolox/git — AES-256-GCM Credential Encryption & Lifecycle (AUTH-007, SEC-002)
 *
 * Encrypts GitHub installation access tokens using AES-256-GCM before database
 * persistence. The `keyVersion` field enables transparent key rotation without
 * re-encryption downtime, satisfying the SEC-002 production assurance hook.
 *
 * Security model:
 * - Key material is sourced exclusively from environment (`MOOLOX_CREDENTIAL_KEY_<version>`).
 * - Each encryption produces a unique 96-bit random IV.
 * - Authentication tags prevent ciphertext tampering.
 * - Key version column enables future rotation workflows.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH_BYTES = 12; // 96-bit IV per NIST SP 800-38D
const AUTH_TAG_LENGTH_BYTES = 16; // 128-bit authentication tag

/**
 * Error thrown when credential encryption or decryption fails.
 */
export class CredentialCryptoError extends Error {
  public readonly code = 'CREDENTIAL_CRYPTO_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'CredentialCryptoError';
  }
}

/**
 * Retrieves the AES-256 key for the specified version from the environment.
 * Key must be a 64-character hex string (32 bytes = 256 bits).
 *
 * Environment variable pattern: `MOOLOX_CREDENTIAL_KEY_<version>`
 * Fallback: `MOOLOX_CREDENTIAL_KEY` for version 1.
 */
export function getEncryptionKey(keyVersion: number): Buffer {
  const envKey = `MOOLOX_CREDENTIAL_KEY_${keyVersion}`;
  const fallbackKey = 'MOOLOX_CREDENTIAL_KEY';

  const hexKey = process.env[envKey] ?? (keyVersion === 1 ? process.env[fallbackKey] : undefined);

  if (!hexKey) {
    throw new CredentialCryptoError(
      `Missing encryption key: environment variable "${envKey}" is not set. ` +
        'Configure a 64-character hex string (256-bit key) for credential encryption.',
    );
  }

  if (!/^[0-9a-f]{64}$/i.test(hexKey)) {
    throw new CredentialCryptoError(
      `Invalid encryption key format in "${envKey}": must be exactly 64 hex characters (256 bits).`,
    );
  }

  return Buffer.from(hexKey, 'hex');
}

/**
 * Resolves the current active key version from the environment.
 * Defaults to 1 if `MOOLOX_CREDENTIAL_KEY_VERSION` is not set.
 */
export function getCurrentKeyVersion(): number {
  const versionStr = process.env.MOOLOX_CREDENTIAL_KEY_VERSION;
  if (!versionStr) {
    return 1;
  }
  const version = parseInt(versionStr, 10);
  if (isNaN(version) || version < 1) {
    throw new CredentialCryptoError(
      `Invalid MOOLOX_CREDENTIAL_KEY_VERSION: "${versionStr}". Must be a positive integer.`,
    );
  }
  return version;
}

/**
 * Result of encrypting a plaintext token.
 */
export interface EncryptedTokenResult {
  /** Base64-encoded ciphertext */
  encryptedToken: string;
  /** Base64-encoded 96-bit IV */
  iv: string;
  /** Base64-encoded 128-bit authentication tag */
  authTag: string;
  /** Key version used for encryption */
  keyVersion: number;
}

/**
 * Encrypts a plaintext GitHub access token using AES-256-GCM.
 *
 * @param plaintext - The raw GitHub installation access token
 * @param keyVersion - Optional key version override (defaults to current active version)
 * @returns Encrypted token components for database storage
 */
export function encryptToken(plaintext: string, keyVersion?: number): EncryptedTokenResult {
  if (!plaintext) {
    throw new CredentialCryptoError('Cannot encrypt empty plaintext.');
  }

  const activeVersion = keyVersion ?? getCurrentKeyVersion();
  const key = getEncryptionKey(activeVersion);
  const iv = randomBytes(IV_LENGTH_BYTES);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedToken: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    keyVersion: activeVersion,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted GitHub access token.
 *
 * @param encryptedToken - Base64-encoded ciphertext
 * @param iv - Base64-encoded initialization vector
 * @param authTag - Base64-encoded authentication tag
 * @param keyVersion - Key version used during encryption
 * @returns The original plaintext GitHub access token
 * @throws CredentialCryptoError if decryption or authentication fails
 */
export function decryptToken(
  encryptedToken: string,
  iv: string,
  authTag: string,
  keyVersion: number,
): string {
  const key = getEncryptionKey(keyVersion);
  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');
  const ciphertext = Buffer.from(encryptedToken, 'base64');

  if (ivBuffer.length !== IV_LENGTH_BYTES) {
    throw new CredentialCryptoError(
      `Invalid IV length: expected ${IV_LENGTH_BYTES} bytes, got ${ivBuffer.length}.`,
    );
  }

  if (authTagBuffer.length !== AUTH_TAG_LENGTH_BYTES) {
    throw new CredentialCryptoError(
      `Invalid auth tag length: expected ${AUTH_TAG_LENGTH_BYTES} bytes, got ${authTagBuffer.length}.`,
    );
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, key, ivBuffer, {
      authTagLength: AUTH_TAG_LENGTH_BYTES,
    });
    decipher.setAuthTag(authTagBuffer);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new CredentialCryptoError(
      `Decryption failed (key version ${keyVersion}): ${error instanceof Error ? error.message : String(error)}. ` +
        'This may indicate a tampered ciphertext, wrong key version, or rotated key.',
    );
  }
}
