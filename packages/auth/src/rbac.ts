/**
 * @moolox/auth — Workspace Role-Based Access Control (`RBAC`) Engine (AUTH-002)
 *
 * Granular permission check matrix (`owner`, `admin`, `editor`, `viewer`, `client_editor`)
 * verified against `workspace_members` table on every protected API route.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq, and } from 'drizzle-orm';
import { type Database, workspaceMembers } from '@moolox/db';
import { type WorkspaceRole } from '@moolox/types';

/**
 * Supported RBAC permission actions across the Moolox platform.
 */
export type PermissionAction =
  | 'DELETE_WORKSPACE'
  | 'MANAGE_BILLING'
  | 'MANAGE_MEMBERS'
  | 'MANAGE_SETTINGS'
  | 'CREATE_PROJECT'
  | 'EDIT_AST'
  | 'PUBLISH_DEPLOYMENT'
  | 'VIEW_PROJECT';

/**
 * Custom error thrown when RBAC permission verification fails.
 */
export class ForbiddenError extends Error {
  public readonly status = 403;
  public readonly code = 'FORBIDDEN';

  constructor(message = 'Access denied. Insufficient workspace permissions.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Static permission matrix defining allowed actions for each WorkspaceRole.
 */
const ROLE_PERMISSIONS: Record<WorkspaceRole, ReadonlySet<PermissionAction>> = {
  owner: new Set([
    'DELETE_WORKSPACE',
    'MANAGE_BILLING',
    'MANAGE_MEMBERS',
    'MANAGE_SETTINGS',
    'CREATE_PROJECT',
    'EDIT_AST',
    'PUBLISH_DEPLOYMENT',
    'VIEW_PROJECT',
  ]),
  admin: new Set([
    'MANAGE_BILLING',
    'MANAGE_MEMBERS',
    'MANAGE_SETTINGS',
    'CREATE_PROJECT',
    'EDIT_AST',
    'PUBLISH_DEPLOYMENT',
    'VIEW_PROJECT',
  ]),
  editor: new Set([
    'CREATE_PROJECT',
    'EDIT_AST',
    'PUBLISH_DEPLOYMENT',
    'VIEW_PROJECT',
  ]),
  client_editor: new Set([
    'EDIT_AST',
    'VIEW_PROJECT',
  ]),
  viewer: new Set([
    'VIEW_PROJECT',
  ]),
};

/**
 * Synchronously checks if a given `WorkspaceRole` grants the requested permission.
 */
export function hasPermission(role: WorkspaceRole, permission: PermissionAction): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.has(permission) : false;
}

/**
 * Asserts that a role has the given permission; throws `ForbiddenError` otherwise.
 */
export function assertPermission(role: WorkspaceRole, permission: PermissionAction): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Role "${role}" does not have permission to perform "${permission}".`);
  }
}

/**
 * Verifies that a user has active membership in a workspace and optionally checks
 * if their assigned role satisfies a required permission action.
 *
 * Queries `workspace_members` (`DB-001`) using Drizzle ORM.
 */
export async function verifyWorkspaceAccess(
  db: Database,
  userId: string,
  workspaceId: string,
  requiredPermission?: PermissionAction,
): Promise<{ role: WorkspaceRole; workspaceId: string; userId: string }> {
  if (!userId || !workspaceId) {
    throw new ForbiddenError('Missing userId or workspaceId for workspace access verification.');
  }

  const result = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId),
    ),
  });

  if (!result) {
    throw new ForbiddenError(`User "${userId}" is not a member of workspace "${workspaceId}".`);
  }

  const role = result.role as WorkspaceRole;

  if (requiredPermission) {
    assertPermission(role, requiredPermission);
  }

  return {
    role,
    workspaceId,
    userId,
  };
}
