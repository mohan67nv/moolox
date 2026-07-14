/**
 * @moolox/auth — JWKS & Header Verification Unit Tests (Feature: AUTH-001)
 *
 * Validates edge JWT token extraction, header parsing, and Clerk role mapping.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  verifyClerkJwt,
  extractAuthContextFromHeaders,
  mapClerkRoleToWorkspaceRole,
  UnauthorizedError,
} from '../src/jwks';

describe('Clerk JWKS Verification & Role Mapping (AUTH-001)', () => {
  const originalEnv = process.env.TEST_MOCK_AUTH;

  beforeEach(() => {
    process.env.TEST_MOCK_AUTH = 'true';
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.TEST_MOCK_AUTH = originalEnv;
    } else {
      delete process.env.TEST_MOCK_AUTH;
    }
  });

  it('mapClerkRoleToWorkspaceRole correctly converts Clerk org roles to Moolox WorkspaceRole', () => {
    expect(mapClerkRoleToWorkspaceRole('org:admin')).toBe('admin');
    expect(mapClerkRoleToWorkspaceRole('org:owner')).toBe('owner');
    expect(mapClerkRoleToWorkspaceRole('org:member')).toBe('editor');
    expect(mapClerkRoleToWorkspaceRole('org:guest')).toBe('viewer');
    expect(mapClerkRoleToWorkspaceRole('org:client_editor')).toBe('client_editor');
    expect(mapClerkRoleToWorkspaceRole('unknown_role')).toBe('editor');
  });

  it('verifyClerkJwt throws UnauthorizedError when token is missing or empty', async () => {
    await expect(verifyClerkJwt('')).rejects.toThrow(UnauthorizedError);
  });

  it('verifyClerkJwt returns decoded claims in test mock mode', async () => {
    const claims = await verifyClerkJwt('test_user_abc');
    expect(claims.sub).toBe('user_test_user_abc');
    expect(claims.email).toBe('test_user_abc@moolox.local');
  });

  it('extractAuthContextFromHeaders parses direct Clerk Edge headers', async () => {
    const headers = new Headers({
      'x-clerk-user-id': 'user_edge_123',
      'x-clerk-user-email': 'edge@moolox.com',
      'x-clerk-org-id': 'ws_alpha',
      'x-clerk-org-role': 'owner',
    });

    const ctx = await extractAuthContextFromHeaders(headers);
    expect(ctx.userId).toBe('user_edge_123');
    expect(ctx.email).toBe('edge@moolox.com');
    expect(ctx.activeWorkspaceId).toBe('ws_alpha');
    expect(ctx.role).toBe('owner');
  });

  it('extractAuthContextFromHeaders parses Authorization Bearer tokens when direct headers are absent', async () => {
    const headers = new Headers({
      authorization: 'Bearer token_xyz',
    });

    const ctx = await extractAuthContextFromHeaders(headers);
    expect(ctx.userId).toBe('user_token_xyz');
    expect(ctx.email).toBe('token_xyz@moolox.local');
  });

  it('extractAuthContextFromHeaders throws UnauthorizedError when both headers and Bearer token are absent', async () => {
    const headers = new Headers();
    await expect(extractAuthContextFromHeaders(headers)).rejects.toThrow(UnauthorizedError);
  });
});
