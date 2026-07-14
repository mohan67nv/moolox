/**
 * @moolox/workspace — Workspace Invites Unit Tests (Feature: WS-002)
 *
 * Validates HMAC invite token generation, tamper detection, and expiration.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { createWorkspaceInviteToken, verifyWorkspaceInviteToken } from '../src/invites';
import { UnauthorizedError, ForbiddenError } from '@moolox/auth';

describe('Role-Based Workspace Invite Links & Verification (WS-002)', () => {
  const secret = 'test_secret_hmac_key_123';

  it('createWorkspaceInviteToken generates a signed token and verifyWorkspaceInviteToken parses its payload accurately', () => {
    const token = createWorkspaceInviteToken({
      workspaceId: 'ws_alpha_1',
      role: 'editor',
      invitedByUserId: 'usr_admin',
      expiresInDays: 7,
      secretKey: secret,
    });

    expect(token.startsWith('invite_')).toBe(true);

    const payload = verifyWorkspaceInviteToken(token, secret);
    expect(payload.workspaceId).toBe('ws_alpha_1');
    expect(payload.role).toBe('editor');
    expect(payload.invitedByUserId).toBe('usr_admin');
    expect(payload.expiresAt).toBeGreaterThan(Date.now());
  });

  it('verifyWorkspaceInviteToken throws UnauthorizedError when token signature is tampered', () => {
    const token = createWorkspaceInviteToken({
      workspaceId: 'ws_beta_2',
      role: 'viewer',
      invitedByUserId: 'usr_owner',
      secretKey: secret,
    });

    // Tamper the signature part of the token
    const tamperedToken = token.slice(0, -5) + 'abcde';

    expect(() => verifyWorkspaceInviteToken(tamperedToken, secret)).toThrow(UnauthorizedError);
  });

  it('verifyWorkspaceInviteToken throws ForbiddenError when token has expired', () => {
    const token = createWorkspaceInviteToken({
      workspaceId: 'ws_expired',
      role: 'admin',
      invitedByUserId: 'usr_owner',
      expiresInDays: -1, // Expired 1 day ago
      secretKey: secret,
    });

    expect(() => verifyWorkspaceInviteToken(token, secret)).toThrow(ForbiddenError);
  });
});
