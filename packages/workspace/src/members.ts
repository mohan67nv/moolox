/**
 * @moolox/workspace — Workspace RBAC Role Management Settings (WS-003)
 *
 * Allows authorized administrators (`MANAGE_MEMBERS`) to promote, demote, or
 * remove workspace members while strictly protecting sole workspace ownership.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq, and } from 'drizzle-orm';
import { type Database, workspaceMembers, type WorkspaceMember } from '@moolox/db';
import { type WorkspaceRole } from '@moolox/types';
import { verifyWorkspaceAccess, ForbiddenError } from '@moolox/auth';

/**
 * Updates a workspace member's role (`WS-003`).
 * Enforces permission hierarchies and prevents demoting the sole workspace owner.
 */
export async function updateMemberRole(
  db: Database,
  actorUserId: string,
  workspaceId: string,
  targetUserId: string,
  newRole: WorkspaceRole,
): Promise<WorkspaceMember> {
  // 1. Verify actor has MANAGE_MEMBERS permission
  const actorAccess = await verifyWorkspaceAccess(db, actorUserId, workspaceId, 'MANAGE_MEMBERS');

  if (actorUserId === targetUserId) {
    throw new ForbiddenError('Users cannot modify their own workspace role directly via management settings.');
  }

  // 2. Locate target user membership
  const targetMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, targetUserId),
    ),
  });

  if (!targetMembership) {
    throw new Error(`Target user "${targetUserId}" is not a member of workspace "${workspaceId}".`);
  }

  const targetRole = targetMembership.role as WorkspaceRole;

  if (targetRole === newRole) {
    return targetMembership; // No change needed
  }

  // 3. Enforce ownership safety guards
  if (targetRole === 'owner') {
    if (actorAccess.role !== 'owner') {
      throw new ForbiddenError('An admin cannot demote or modify a workspace owner.');
    }

    if (newRole !== 'owner') {
      // Check if target is the sole owner
      const owners = await db.query.workspaceMembers.findMany({
        where: and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, 'owner'),
        ),
      });

      if (owners.length <= 1) {
        throw new ForbiddenError('Cannot demote the sole owner of a workspace. Please assign another owner first.');
      }
    }
  }

  // 4. Perform update in database
  const [updated] = await db
    .update(workspaceMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, targetUserId),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error(`Failed to update role for user "${targetUserId}" on workspace "${workspaceId}".`);
  }

  return updated;
}

/**
 * Removes a member from a workspace (`WS-003`).
 * Enforces hierarchy guards and protects sole ownership.
 */
export async function removeWorkspaceMember(
  db: Database,
  actorUserId: string,
  workspaceId: string,
  targetUserId: string,
): Promise<boolean> {
  // 1. Verify actor has MANAGE_MEMBERS permission
  const actorAccess = await verifyWorkspaceAccess(db, actorUserId, workspaceId, 'MANAGE_MEMBERS');

  // 2. Locate target user membership
  const targetMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, targetUserId),
    ),
  });

  if (!targetMembership) {
    return false; // Already not a member
  }

  const targetRole = targetMembership.role as WorkspaceRole;

  // 3. Enforce ownership safety guards
  if (targetRole === 'owner') {
    if (actorAccess.role !== 'owner') {
      throw new ForbiddenError('An admin cannot remove a workspace owner.');
    }

    const owners = await db.query.workspaceMembers.findMany({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.role, 'owner'),
      ),
    });

    if (owners.length <= 1) {
      throw new ForbiddenError('Cannot remove the sole owner of a workspace.');
    }
  }

  // 4. Delete from workspace_members
  const [deleted] = await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, targetUserId),
      ),
    )
    .returning();

  return Boolean(deleted);
}
