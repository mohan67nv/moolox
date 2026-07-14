/**
 * @moolox/workspace — Workspace Lifecycle Management (WS-001)
 *
 * Creates multi-tenant workspace organizations (`workspaces`) and initializes
 * exact ownership records (`workspace_members`) within a single transactional flow.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type Database, workspaces, workspaceMembers, type Workspace, type WorkspaceMember } from '@moolox/db';
import { type WorkspaceRole } from '@moolox/types';

/**
 * Options when creating a new workspace.
 */
export interface CreateWorkspaceOptions {
  /** Initial AI credit allowance (`1000` by default -> $10.00 value) */
  aiCreditsLimit?: number;
  /** Custom workspace ID (`ws_{uuid}` by default) */
  workspaceId?: string;
  /** Enterprise organization ID if federated under v3.0 Enterprise */
  enterpriseOrgId?: string;
}

/**
 * Creates a new multi-tenant workspace and assigns the creator as the sole `owner`.
 */
export async function createWorkspace(
  db: Database,
  ownerUserId: string,
  name: string,
  slug: string,
  options: CreateWorkspaceOptions = {},
): Promise<{ workspace: Workspace; membership: WorkspaceMember }> {
  if (!ownerUserId || !name || !slug) {
    throw new Error('Missing required arguments (`ownerUserId`, `name`, `slug`) to create workspace.');
  }

  const workspaceId = options.workspaceId || `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  // 1. Insert into workspaces (`DB-001`)
  const [insertedWorkspace] = await db
    .insert(workspaces)
    .values({
      id: workspaceId,
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      aiCreditsLimit: options.aiCreditsLimit ?? 1000,
      aiCreditsUsed: 0,
      enterpriseOrgId: options.enterpriseOrgId || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!insertedWorkspace) {
    throw new Error('Failed to insert workspace record into database.');
  }

  // 2. Insert owner membership into workspace_members (`DB-001`)
  const [insertedMembership] = await db
    .insert(workspaceMembers)
    .values({
      workspaceId: insertedWorkspace.id,
      userId: ownerUserId,
      role: 'owner' satisfies WorkspaceRole,
      joinedAt: now,
    })
    .returning();

  if (!insertedMembership) {
    throw new Error(`Failed to assign owner membership for user "${ownerUserId}" on workspace "${insertedWorkspace.id}".`);
  }

  return {
    workspace: insertedWorkspace,
    membership: insertedMembership,
  };
}
