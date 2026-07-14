/**
 * @moolox/workspace — Multi-Workspace Dashboard Data Service (WS-004)
 *
 * Provides aggregated dashboard views across all workspaces a user
 * is a member of, including project counts, member counts, recent
 * activity summaries, and workspace health indicators.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq, desc, sql, and } from 'drizzle-orm';
import {
  type Database,
  workspaces,
  workspaceMembers,
  projects,
  auditLogs,
  syncEvents,
} from '@moolox/db';
import type { WorkspaceRole } from '@moolox/types';

// ---------------------------------------------------------------------------
// Dashboard Types
// ---------------------------------------------------------------------------

/** Summary of a single workspace for the dashboard matrix. */
export interface WorkspaceSummary {
  /** Workspace ID */
  id: string;
  /** Workspace name */
  name: string;
  /** Workspace slug */
  slug: string;
  /** Current subscription plan */
  plan: string;
  /** User's role in this workspace */
  userRole: WorkspaceRole;
  /** Total number of projects */
  projectCount: number;
  /** Total number of members */
  memberCount: number;
  /** AI credits used / total */
  aiCredits: {
    used: number;
    limit: number;
    percentage: number;
  };
  /** Most recent activity timestamp */
  lastActivityAt: Date | null;
  /** Whether a GitHub App is installed */
  hasGitHubIntegration: boolean;
}

/** Aggregated dashboard data for a user across all workspaces. */
export interface DashboardData {
  /** All workspaces the user belongs to */
  workspaces: WorkspaceSummary[];
  /** Total workspaces count */
  totalWorkspaces: number;
  /** Total projects across all workspaces */
  totalProjects: number;
  /** Recent activity across all workspaces */
  recentActivity: RecentActivityItem[];
}

/** Single recent activity item for the dashboard feed. */
export interface RecentActivityItem {
  /** Activity ID */
  id: string;
  /** Workspace this activity belongs to */
  workspaceId: string;
  /** Workspace name */
  workspaceName: string;
  /** Action type */
  action: string;
  /** Actor user ID */
  actorId: string;
  /** Human-readable metadata */
  metadata: Record<string, unknown> | null;
  /** When the activity occurred */
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Dashboard Queries
// ---------------------------------------------------------------------------

/**
 * Retrieves the multi-workspace dashboard data for a user.
 *
 * @param db - Database client
 * @param userId - Authenticated user ID
 * @param recentActivityLimit - Maximum recent activity items to return (default: 20)
 * @returns Aggregated dashboard data
 */
export async function getDashboardData(
  db: Database,
  userId: string,
  recentActivityLimit = 20,
): Promise<DashboardData> {
  // 1. Get all workspace memberships for this user
  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, userId),
    with: {
      workspace: true,
    },
  });

  if (memberships.length === 0) {
    return {
      workspaces: [],
      totalWorkspaces: 0,
      totalProjects: 0,
      recentActivity: [],
    };
  }

  // 2. Build workspace summaries with aggregated counts
  const workspaceSummaries: WorkspaceSummary[] = [];
  let totalProjects = 0;

  for (const membership of memberships) {
    const ws = membership.workspace;

    // Count projects
    const projectCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.workspaceId, ws.id));

    const projectCount = projectCountResult[0]?.count ?? 0;
    totalProjects += projectCount;

    // Count members
    const memberCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, ws.id));

    const memberCount = memberCountResult[0]?.count ?? 0;

    // Check for GitHub integration
    const { githubInstallations } = await import('@moolox/db');
    const ghInstallation = await db.query.githubInstallations.findFirst({
      where: and(
        eq(githubInstallations.workspaceId, ws.id),
        eq(githubInstallations.status, 'active'),
      ),
    });

    // Get last activity
    const lastActivity = await db.query.auditLogs.findFirst({
      where: eq(auditLogs.workspaceId, ws.id),
      orderBy: [desc(auditLogs.createdAt)],
    });

    const aiCreditsUsed = ws.aiCreditsUsed;
    const aiCreditsLimit = ws.aiCreditsLimit;

    workspaceSummaries.push({
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      plan: ws.plan,
      userRole: membership.role as WorkspaceRole,
      projectCount,
      memberCount,
      aiCredits: {
        used: aiCreditsUsed,
        limit: aiCreditsLimit,
        percentage: aiCreditsLimit > 0 ? Math.round((aiCreditsUsed / aiCreditsLimit) * 100) : 0,
      },
      lastActivityAt: lastActivity?.createdAt ?? null,
      hasGitHubIntegration: Boolean(ghInstallation),
    });
  }

  // 3. Fetch recent activity across all user's workspaces
  const workspaceIds = memberships.map((m) => m.workspace.id);
  const recentActivity = await getRecentActivityForWorkspaces(
    db,
    workspaceIds,
    memberships.reduce(
      (acc, m) => {
        acc[m.workspace.id] = m.workspace.name;
        return acc;
      },
      {} as Record<string, string>,
    ),
    recentActivityLimit,
  );

  return {
    workspaces: workspaceSummaries,
    totalWorkspaces: workspaceSummaries.length,
    totalProjects,
    recentActivity,
  };
}

/**
 * Fetches recent activity items across multiple workspaces.
 */
async function getRecentActivityForWorkspaces(
  db: Database,
  workspaceIds: string[],
  workspaceNames: Record<string, string>,
  limit: number,
): Promise<RecentActivityItem[]> {
  if (workspaceIds.length === 0) return [];

  // Use raw SQL for IN clause with workspace IDs
  const logs = await db.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit,
  });

  // Filter to only logs from the user's workspaces
  return logs
    .filter((log) => workspaceIds.includes(log.workspaceId))
    .slice(0, limit)
    .map((log) => ({
      id: log.id,
      workspaceId: log.workspaceId,
      workspaceName: workspaceNames[log.workspaceId] ?? 'Unknown',
      action: log.action,
      actorId: log.actorId,
      metadata: log.metadata,
      createdAt: log.createdAt,
    }));
}

/**
 * Retrieves a single workspace's detailed dashboard summary.
 * Used for workspace-specific dashboard views.
 */
export async function getWorkspaceDetail(
  db: Database,
  workspaceId: string,
): Promise<WorkspaceSummary | null> {
  const ws = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!ws) return null;

  const projectCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.workspaceId, ws.id));

  const memberCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, ws.id));

  const { githubInstallations } = await import('@moolox/db');
  const ghInstallation = await db.query.githubInstallations.findFirst({
    where: and(
      eq(githubInstallations.workspaceId, ws.id),
      eq(githubInstallations.status, 'active'),
    ),
  });

  return {
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
    plan: ws.plan,
    userRole: 'owner', // Will be enriched by the caller
    projectCount: projectCountResult[0]?.count ?? 0,
    memberCount: memberCountResult[0]?.count ?? 0,
    aiCredits: {
      used: ws.aiCreditsUsed,
      limit: ws.aiCreditsLimit,
      percentage:
        ws.aiCreditsLimit > 0
          ? Math.round((ws.aiCreditsUsed / ws.aiCreditsLimit) * 100)
          : 0,
    },
    lastActivityAt: null,
    hasGitHubIntegration: Boolean(ghInstallation),
  };
}
