/**
 * @moolox/workspace — Workspace RBAC Member Management Unit Tests (Feature: WS-003)
 *
 * Validates permission assertions and sole workspace ownership protection.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { updateMemberRole } from '../src/members';
import { ForbiddenError } from '@moolox/auth';

describe('Workspace RBAC Role Management Settings (WS-003)', () => {
  it('updateMemberRole throws ForbiddenError when a user attempts to change their own role directly', async () => {
    // Pass dummy db mock since self-check occurs right after permission verification or if actor access passes
    const dummyDb = {
      query: {
        workspaceMembers: {
          findFirst: async () => ({ role: 'owner', workspaceId: 'ws_1', userId: 'usr_self' }),
        },
      },
    } as unknown as Parameters<typeof updateMemberRole>[0];

    await expect(
      updateMemberRole(dummyDb, 'usr_self', 'ws_1', 'usr_self', 'viewer'),
    ).rejects.toThrow(ForbiddenError);
  });
});
