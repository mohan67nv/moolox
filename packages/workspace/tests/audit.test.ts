/**
 * @moolox/workspace — Immutable Audit Feed Tests (WS-005)
 */

import { describe, it, expect } from 'vitest';
import { AUDIT_ACTIONS, type AppendAuditLogInput } from '../src/audit';

describe('Audit Feed Action Types & Constants (WS-005)', () => {
  it('contains canonical action constants across platform domains', () => {
    expect(AUDIT_ACTIONS.WORKSPACE_CREATED).toBe('WORKSPACE_CREATED');
    expect(AUDIT_ACTIONS.GITHUB_APP_INSTALLED).toBe('GITHUB_APP_INSTALLED');
    expect(AUDIT_ACTIONS.GITHUB_REPO_LINKED).toBe('GITHUB_REPO_LINKED');
    expect(AUDIT_ACTIONS.PROJECT_VERSION_CREATED).toBe('PROJECT_VERSION_CREATED');
    expect(AUDIT_ACTIONS.CREDENTIAL_ROTATED).toBe('CREDENTIAL_ROTATED');
  });

  it('validates structure of AppendAuditLogInput', () => {
    const input: AppendAuditLogInput = {
      workspaceId: 'ws_123',
      actorId: 'usr_456',
      action: AUDIT_ACTIONS.GITHUB_REPO_LINKED,
      metadata: { repo: 'moolox/dios' },
      ipAddress: '192.168.1.1',
    };

    expect(input.workspaceId).toBe('ws_123');
    expect(input.action).toBe('GITHUB_REPO_LINKED');
    expect(input.metadata).toEqual({ repo: 'moolox/dios' });
  });
});
