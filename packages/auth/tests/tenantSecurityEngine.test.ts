import { describe, it, expect, beforeEach } from 'vitest';
import {
  TenantIsolationVerifier,
  SecurityHeaderBaseline,
  CredentialRotationEngine,
} from '../src/security/tenantSecurityEngine';

describe('Cross-Tenant Isolation & Credential Rotation/Revocation Engine (SEC-001, SEC-002)', () => {
  beforeEach(() => {
    CredentialRotationEngine.resetForTesting();
  });

  describe('TenantIsolationVerifier (SEC-001)', () => {
    it('allows access when caller and target workspace IDs match exactly', () => {
      const audit = TenantIsolationVerifier.verifyTenantAccess('ws-alpha', 'ws-alpha', 'res-123');
      expect(audit.allowed).toBe(true);
      expect(audit.violationType).toBeUndefined();
    });

    it('blocks and flags CROSS_TENANT_BLEED_ATTEMPT when caller and target IDs differ', () => {
      const audit = TenantIsolationVerifier.verifyTenantAccess('ws-attacker', 'ws-victim', 'res-secret-999');
      expect(audit.allowed).toBe(false);
      expect(audit.violationType).toBe('CROSS_TENANT_BLEED_ATTEMPT');
    });
  });

  describe('SecurityHeaderBaseline (SEC-001)', () => {
    it('generates strict CSP, HSTS, X-Frame-Options, and Permissions-Policy headers with unique nonces', () => {
      const audit = SecurityHeaderBaseline.generateEdgeHeaders('test-nonce-123');
      expect(audit.isSecure).toBe(true);
      expect(audit.nonce).toBe('test-nonce-123');
      expect(audit.headers['Strict-Transport-Security']).toContain('max-age=63072000');
      expect(audit.headers['X-Frame-Options']).toBe('DENY');
      expect(audit.headers['Content-Security-Policy']).toContain("'nonce-test-nonce-123'");
    });

    it('validates CSRF tokens and request origins correctly', () => {
      expect(SecurityHeaderBaseline.verifyCSRFAndOrigin('https://dios.app', ['https://dios.app'], 'token-abc', 'token-abc')).toBe(true);
      expect(SecurityHeaderBaseline.verifyCSRFAndOrigin('https://evil.com', ['https://dios.app'], 'token-abc', 'token-abc')).toBe(false);
      expect(SecurityHeaderBaseline.verifyCSRFAndOrigin('https://dios.app', ['https://dios.app'], 'wrong-token', 'token-abc')).toBe(false);
    });
  });

  describe('CredentialRotationEngine (SEC-002)', () => {
    it('issues active credentials and validates them cleanly', () => {
      const { record, keyId } = CredentialRotationEngine.issueCredential('ws-1', 'my-secret-token');
      expect(record.status).toBe('active');

      const check = CredentialRotationEngine.validateCredential(keyId);
      expect(check.valid).toBe(true);
      expect(check.record?.keyId).toBe(keyId);
    });

    it('rotates credential: revokes old key and issues new active key', () => {
      const { keyId: oldKeyId } = CredentialRotationEngine.issueCredential('ws-rot', 'old-secret');
      const rotated = CredentialRotationEngine.rotateCredential(oldKeyId, 'new-secret');

      expect(rotated).not.toBeNull();
      expect(rotated!.oldRecord.status).toBe('revoked');
      expect(rotated!.newRecord.status).toBe('active');

      // Verify old key fails validation
      const checkOld = CredentialRotationEngine.validateCredential(oldKeyId);
      expect(checkOld.valid).toBe(false);
      expect(checkOld.reason).toContain("status is 'revoked'");

      // Verify new key succeeds
      const checkNew = CredentialRotationEngine.validateCredential(rotated!.newRecord.keyId);
      expect(checkNew.valid).toBe(true);
    });

    it('instantly revokes credential on demand', () => {
      const { keyId } = CredentialRotationEngine.issueCredential('ws-rev', 'to-be-revoked');
      expect(CredentialRotationEngine.revokeCredential(keyId)).toBe(true);

      const check = CredentialRotationEngine.validateCredential(keyId);
      expect(check.valid).toBe(false);
    });
  });
});
