/**
 * @moolox/auth — Cross-Tenant Isolation & Credential Security Engine
 *
 * Feature IDs: SEC-001, SEC-002
 *
 * Enforces zero-bleed cross-tenant data access verification (`SEC-001`)
 * and manages automated credential rotation and instant revocation (`SEC-002`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export interface TenantIsolationAudit {
  callerWorkspaceId: string;
  targetWorkspaceId: string;
  resourceId: string;
  allowed: boolean;
  violationType?: 'CROSS_TENANT_BLEED_ATTEMPT' | 'INVALID_WORKSPACE';
  auditTimestamp: number;
}

export interface CredentialRecord {
  keyId: string;
  workspaceId: string;
  hashedSecret: string;
  status: 'active' | 'revoked' | 'rotating';
  createdAt: number;
  rotatedAt?: number;
  revokedAt?: number;
}

export class TenantIsolationVerifier {
  /**
   * Verifies whether a caller belonging to callerWorkspaceId is allowed to access
   * a target resource belonging to targetWorkspaceId (`SEC-001`).
   */
  static verifyTenantAccess(
    callerWorkspaceId: string,
    targetWorkspaceId: string,
    resourceId: string,
  ): TenantIsolationAudit {
    const isMatch = callerWorkspaceId === targetWorkspaceId && Boolean(callerWorkspaceId);

    return {
      callerWorkspaceId,
      targetWorkspaceId,
      resourceId,
      allowed: isMatch,
      violationType: !isMatch ? 'CROSS_TENANT_BLEED_ATTEMPT' : undefined,
      auditTimestamp: Date.now(),
    };
  }
}

export class CredentialRotationEngine {
  private static credentials = new Map<string, CredentialRecord>();

  /**
   * Provisions a new API key or secret credential for a workspace (`SEC-002`).
   */
  static issueCredential(workspaceId: string, secretPlaintext: string): { record: CredentialRecord; keyId: string } {
    const keyId = `key-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const hashedSecret = `hash-${secretPlaintext.split('').reverse().join('')}`;

    const record: CredentialRecord = {
      keyId,
      workspaceId,
      hashedSecret,
      status: 'active',
      createdAt: Date.now(),
    };

    this.credentials.set(keyId, record);
    return { record, keyId };
  }

  /**
   * Rotates an existing credential seamlessly, issuing a new key and marking the old key rotating/revoked (`SEC-002`).
   */
  static rotateCredential(keyId: string, newSecretPlaintext: string): { oldRecord: CredentialRecord; newRecord: CredentialRecord } | null {
    const oldRecord = this.credentials.get(keyId);
    if (!oldRecord || oldRecord.status === 'revoked') return null;

    oldRecord.status = 'revoked';
    oldRecord.rotatedAt = Date.now();
    this.credentials.set(keyId, oldRecord);

    const { record: newRecord } = this.issueCredential(oldRecord.workspaceId, newSecretPlaintext);
    return { oldRecord, newRecord };
  }

  /**
   * Instantly revokes a credential key (`SEC-002`).
   */
  static revokeCredential(keyId: string): boolean {
    const record = this.credentials.get(keyId);
    if (!record) return false;

    record.status = 'revoked';
    record.revokedAt = Date.now();
    this.credentials.set(keyId, record);
    return true;
  }

  /**
   * Validates a credential key against its status (`SEC-002`).
   */
  static validateCredential(keyId: string): { valid: boolean; record?: CredentialRecord; reason?: string } {
    const record = this.credentials.get(keyId);
    if (!record) {
      return { valid: false, reason: 'Credential key not found.' };
    }
    if (record.status !== 'active') {
      return { valid: false, record, reason: `Credential status is '${record.status}'. Access denied (` + `SEC-002` + `).` };
    }
    return { valid: true, record };
  }

  static resetForTesting(): void {
    this.credentials.clear();
  }
}
