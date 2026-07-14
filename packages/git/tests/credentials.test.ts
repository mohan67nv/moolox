/**
 * @moolox/git — Credential Encryption Tests (AUTH-007, SEC-002)
 *
 * Tests AES-256-GCM encryption/decryption, key versioning, key rotation,
 * and error handling for the credential lifecycle module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  encryptToken,
  decryptToken,
  getEncryptionKey,
  getCurrentKeyVersion,
  CredentialCryptoError,
} from '../src/github/credentials';
import { randomBytes } from 'node:crypto';

// Generate a valid 256-bit hex key for testing
const TEST_KEY_V1 = randomBytes(32).toString('hex');
const TEST_KEY_V2 = randomBytes(32).toString('hex');

describe('Credential Encryption (AUTH-007, SEC-002)', () => {
  beforeEach(() => {
    // Set up test encryption keys
    process.env.MOOLOX_CREDENTIAL_KEY = TEST_KEY_V1;
    process.env.MOOLOX_CREDENTIAL_KEY_1 = TEST_KEY_V1;
    process.env.MOOLOX_CREDENTIAL_KEY_2 = TEST_KEY_V2;
    process.env.MOOLOX_CREDENTIAL_KEY_VERSION = '1';
  });

  afterEach(() => {
    delete process.env.MOOLOX_CREDENTIAL_KEY;
    delete process.env.MOOLOX_CREDENTIAL_KEY_1;
    delete process.env.MOOLOX_CREDENTIAL_KEY_2;
    delete process.env.MOOLOX_CREDENTIAL_KEY_VERSION;
  });

  describe('getEncryptionKey', () => {
    it('retrieves key by version from environment', () => {
      const key = getEncryptionKey(1);
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32); // 256 bits
    });

    it('falls back to MOOLOX_CREDENTIAL_KEY for version 1', () => {
      delete process.env.MOOLOX_CREDENTIAL_KEY_1;
      const key = getEncryptionKey(1);
      expect(key.length).toBe(32);
    });

    it('throws CredentialCryptoError for missing key', () => {
      expect(() => getEncryptionKey(99)).toThrow(CredentialCryptoError);
      expect(() => getEncryptionKey(99)).toThrow(/MOOLOX_CREDENTIAL_KEY_99/);
    });

    it('throws CredentialCryptoError for invalid hex format', () => {
      process.env.MOOLOX_CREDENTIAL_KEY_3 = 'not-a-valid-hex-key';
      expect(() => getEncryptionKey(3)).toThrow(CredentialCryptoError);
      expect(() => getEncryptionKey(3)).toThrow(/64 hex characters/);
    });

    it('throws for key that is too short', () => {
      process.env.MOOLOX_CREDENTIAL_KEY_3 = 'abcdef';
      expect(() => getEncryptionKey(3)).toThrow(CredentialCryptoError);
    });
  });

  describe('getCurrentKeyVersion', () => {
    it('returns version from environment', () => {
      process.env.MOOLOX_CREDENTIAL_KEY_VERSION = '2';
      expect(getCurrentKeyVersion()).toBe(2);
    });

    it('defaults to 1 when not set', () => {
      delete process.env.MOOLOX_CREDENTIAL_KEY_VERSION;
      expect(getCurrentKeyVersion()).toBe(1);
    });

    it('throws for invalid version string', () => {
      process.env.MOOLOX_CREDENTIAL_KEY_VERSION = 'abc';
      expect(() => getCurrentKeyVersion()).toThrow(CredentialCryptoError);
    });

    it('throws for zero version', () => {
      process.env.MOOLOX_CREDENTIAL_KEY_VERSION = '0';
      expect(() => getCurrentKeyVersion()).toThrow(CredentialCryptoError);
    });
  });

  describe('encryptToken / decryptToken roundtrip', () => {
    it('encrypts and decrypts a token correctly', () => {
      const plaintext = 'ghs_mockGitHubInstallationToken_123456789';
      const encrypted = encryptToken(plaintext);

      expect(encrypted.encryptedToken).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
      expect(encrypted.keyVersion).toBe(1);

      const decrypted = decryptToken(
        encrypted.encryptedToken,
        encrypted.iv,
        encrypted.authTag,
        encrypted.keyVersion,
      );

      expect(decrypted).toBe(plaintext);
    });

    it('produces different ciphertexts for the same plaintext (random IV)', () => {
      const plaintext = 'ghs_sameToken';
      const encrypted1 = encryptToken(plaintext);
      const encrypted2 = encryptToken(plaintext);

      expect(encrypted1.encryptedToken).not.toBe(encrypted2.encryptedToken);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('handles long token strings', () => {
      const longToken = 'ghs_' + 'a'.repeat(1000);
      const encrypted = encryptToken(longToken);
      const decrypted = decryptToken(
        encrypted.encryptedToken,
        encrypted.iv,
        encrypted.authTag,
        encrypted.keyVersion,
      );
      expect(decrypted).toBe(longToken);
    });

    it('handles special characters in tokens', () => {
      const specialToken = 'token+with/special=chars&more!@#$%';
      const encrypted = encryptToken(specialToken);
      const decrypted = decryptToken(
        encrypted.encryptedToken,
        encrypted.iv,
        encrypted.authTag,
        encrypted.keyVersion,
      );
      expect(decrypted).toBe(specialToken);
    });

    it('respects explicit key version override', () => {
      const plaintext = 'test_token';
      const encrypted = encryptToken(plaintext, 2);

      expect(encrypted.keyVersion).toBe(2);

      const decrypted = decryptToken(
        encrypted.encryptedToken,
        encrypted.iv,
        encrypted.authTag,
        2,
      );
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('key rotation simulation', () => {
    it('decrypts tokens encrypted with old key version using correct key', () => {
      const plaintext = 'ghs_rotationTest';

      // Encrypt with v1
      const encryptedV1 = encryptToken(plaintext, 1);
      expect(encryptedV1.keyVersion).toBe(1);

      // Encrypt same token with v2
      const encryptedV2 = encryptToken(plaintext, 2);
      expect(encryptedV2.keyVersion).toBe(2);

      // Both decrypt correctly with their respective keys
      const decryptedV1 = decryptToken(
        encryptedV1.encryptedToken,
        encryptedV1.iv,
        encryptedV1.authTag,
        1,
      );
      const decryptedV2 = decryptToken(
        encryptedV2.encryptedToken,
        encryptedV2.iv,
        encryptedV2.authTag,
        2,
      );

      expect(decryptedV1).toBe(plaintext);
      expect(decryptedV2).toBe(plaintext);
    });

    it('fails to decrypt with wrong key version', () => {
      const encrypted = encryptToken('ghs_wrongKey', 1);

      expect(() =>
        decryptToken(encrypted.encryptedToken, encrypted.iv, encrypted.authTag, 2),
      ).toThrow(CredentialCryptoError);
    });
  });

  describe('tamper detection', () => {
    it('detects tampered ciphertext', () => {
      const encrypted = encryptToken('ghs_tamperTest');

      // Tamper with the ciphertext
      const tamperedCiphertext = Buffer.from(encrypted.encryptedToken, 'base64');
      tamperedCiphertext[0] = (tamperedCiphertext[0]! ^ 0xff) & 0xff;
      const tampered = tamperedCiphertext.toString('base64');

      expect(() =>
        decryptToken(tampered, encrypted.iv, encrypted.authTag, encrypted.keyVersion),
      ).toThrow(CredentialCryptoError);
    });

    it('detects tampered auth tag', () => {
      const encrypted = encryptToken('ghs_tamperAuthTag');

      const tamperedTag = Buffer.from(encrypted.authTag, 'base64');
      tamperedTag[0] = (tamperedTag[0]! ^ 0xff) & 0xff;
      const tampered = tamperedTag.toString('base64');

      expect(() =>
        decryptToken(encrypted.encryptedToken, encrypted.iv, tampered, encrypted.keyVersion),
      ).toThrow(CredentialCryptoError);
    });
  });

  describe('error handling', () => {
    it('throws for empty plaintext', () => {
      expect(() => encryptToken('')).toThrow(CredentialCryptoError);
      expect(() => encryptToken('')).toThrow(/empty plaintext/);
    });

    it('throws for invalid IV length', () => {
      const encrypted = encryptToken('test');
      const shortIv = Buffer.alloc(8).toString('base64'); // 8 bytes instead of 12

      expect(() =>
        decryptToken(encrypted.encryptedToken, shortIv, encrypted.authTag, 1),
      ).toThrow(CredentialCryptoError);
    });

    it('throws for invalid auth tag length', () => {
      const encrypted = encryptToken('test');
      const shortTag = Buffer.alloc(8).toString('base64'); // 8 bytes instead of 16

      expect(() =>
        decryptToken(encrypted.encryptedToken, encrypted.iv, shortTag, 1),
      ).toThrow(CredentialCryptoError);
    });
  });
});
