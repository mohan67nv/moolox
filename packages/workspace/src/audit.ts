/**
 * @moolox/workspace — Immutable Append-Only Audit Feed (WS-005)
 *
 * Production-grade audit trail implementation providing:
 * - Immutable append-only writes (no updates or deletes)
 * - Structured action types with metadata payloads
 * - Paginated retrieval with cursor-based pagination
 * - Filtering by action type, actor, and date range
 *
 * The audit feed is the single source of truth for workspace activity
 * tracking, compliance reporting, and security incident investigation.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq, and, desc, gt, lt, sql } from 'drizzle-orm';
import { type Database, auditLogs, type NewAuditLog, type AuditLog } from '@moolox/db';

// ---------------------------------------------------------------------------
// Audit Action Types
// ---------------------------------------------------------------------------

/**
 * Canonical audit action types across the Moolox platform.
 * Organized by domain for clarity and filtering.
 */
export const AUDIT_ACTIONS = {
  // Workspace lifecycle
  WORKSPACE_CREATED: 'WORKSPACE_CREATED',
  WORKSPACE_SETTINGS_UPDATED: 'WORKSPACE_SETTINGS_UPDATED',
  WORKSPACE_PLAN_CHANGED: 'WORKSPACE_PLAN_CHANGED',

  // Member management
  MEMBER_INVITED: 'MEMBER_INVITED',
  MEMBER_JOINED: 'MEMBER_JOINED',
  MEMBER_ROLE_CHANGED: 'MEMBER_ROLE_CHANGED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',

  // Project lifecycle
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  PROJECT_VERSION_CREATED: 'PROJECT_VERSION_CREATED',

  // GitHub integration
  GITHUB_APP_INSTALLED: 'GITHUB_APP_INSTALLED',
  GITHUB_APP_UNINSTALLED: 'GITHUB_APP_UNINSTALLED',
  GITHUB_REPO_LINKED: 'GITHUB_REPO_LINKED',
  GITHUB_REPO_UNLINKED: 'GITHUB_REPO_UNLINKED',
  GITHUB_PUSH_COMPLETED: 'GITHUB_PUSH_COMPLETED',
  GITHUB_PUSH_FAILED: 'GITHUB_PUSH_FAILED',
  GITHUB_PULL_COMPLETED: 'GITHUB_PULL_COMPLETED',
  GITHUB_PULL_FAILED: 'GITHUB_PULL_FAILED',

  // AI operations
  AI_PROMPT_EXECUTED: 'AI_PROMPT_EXECUTED',
  AI_CREDITS_EXHAUSTED: 'AI_CREDITS_EXHAUSTED',

  // Deployment
  DEPLOYMENT_PUBLISHED: 'DEPLOYMENT_PUBLISHED',
  DEPLOYMENT_ROLLED_BACK: 'DEPLOYMENT_ROLLED_BACK',

  // Billing
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',

  // Security
  CREDENTIAL_ROTATED: 'CREDENTIAL_ROTATED',
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// ---------------------------------------------------------------------------
// Audit Write Operations (Append-Only)
// ---------------------------------------------------------------------------

/** Input for appending an audit log entry. */
export interface AppendAuditLogInput {
  /** Workspace ID */
  workspaceId: string;
  /** Actor user ID */
  actorId: string;
  /** Canonical action type */
  action: string;
  /** Structured metadata payload */
  metadata?: Record<string, unknown>;
  /** Client IP address (if available) */
  ipAddress?: string;
}

/**
 * Appends an immutable audit log entry.
 *
 * This is the ONLY write operation on the audit_logs table.
 * There are intentionally no update or delete functions — the audit
 * feed is append-only by design for compliance and security.
 *
 * @param db - Database client
 * @param input - Audit log entry data
 * @returns The created audit log record
 */
export async function appendAuditLog(
  db: Database,
  input: AppendAuditLogInput,
): Promise<AuditLog> {
  const id = generateId();

  const entry: NewAuditLog = {
    id,
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: input.action,
    metadata: input.metadata ?? null,
    ipAddress: input.ipAddress ?? null,
  };

  const [created] = await db.insert(auditLogs).values(entry).returning();

  if (!created) {
    throw new Error('Failed to append audit log entry.');
  }

  return created;
}

/**
 * Appends multiple audit log entries in a single transaction.
 * Used for batch operations that produce multiple audit events.
 */
export async function appendAuditLogBatch(
  db: Database,
  inputs: AppendAuditLogInput[],
): Promise<AuditLog[]> {
  if (inputs.length === 0) return [];

  const entries: NewAuditLog[] = inputs.map((input) => ({
    id: generateId(),
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    action: input.action,
    metadata: input.metadata ?? null,
    ipAddress: input.ipAddress ?? null,
  }));

  return db.insert(auditLogs).values(entries).returning();
}

// ---------------------------------------------------------------------------
// Audit Read Operations (Paginated)
// ---------------------------------------------------------------------------

/** Filter options for querying audit logs. */
export interface AuditLogFilter {
  /** Filter by action type */
  action?: string;
  /** Filter by actor user ID */
  actorId?: string;
  /** Filter entries created after this date */
  after?: Date;
  /** Filter entries created before this date */
  before?: Date;
}

/** Paginated audit log result. */
export interface PaginatedAuditLogs {
  /** Audit log entries */
  entries: AuditLog[];
  /** Cursor for the next page (last entry's ID) */
  nextCursor: string | null;
  /** Whether there are more entries */
  hasMore: boolean;
  /** Total count matching the filter (if requested) */
  totalCount?: number;
}

/**
 * Retrieves paginated audit log entries for a workspace.
 *
 * Uses cursor-based pagination for consistent results even
 * when new entries are appended during reading.
 *
 * @param db - Database client
 * @param workspaceId - Workspace to query
 * @param options - Pagination and filter options
 * @returns Paginated audit log entries
 */
export async function getAuditLogs(
  db: Database,
  workspaceId: string,
  options: {
    limit?: number;
    cursor?: string;
    filter?: AuditLogFilter;
    includeTotalCount?: boolean;
  } = {},
): Promise<PaginatedAuditLogs> {
  const limit = Math.min(options.limit ?? 50, 100); // Cap at 100
  const conditions = [eq(auditLogs.workspaceId, workspaceId)];

  // Apply cursor-based pagination
  if (options.cursor) {
    conditions.push(lt(auditLogs.id, options.cursor));
  }

  // Apply filters
  if (options.filter?.action) {
    conditions.push(eq(auditLogs.action, options.filter.action));
  }

  if (options.filter?.actorId) {
    conditions.push(eq(auditLogs.actorId, options.filter.actorId));
  }

  if (options.filter?.after) {
    conditions.push(gt(auditLogs.createdAt, options.filter.after));
  }

  if (options.filter?.before) {
    conditions.push(lt(auditLogs.createdAt, options.filter.before));
  }

  // Fetch one extra to determine hasMore
  const entries = await db.query.auditLogs.findMany({
    where: and(...conditions),
    orderBy: [desc(auditLogs.createdAt)],
    limit: limit + 1,
  });

  const hasMore = entries.length > limit;
  const resultEntries = hasMore ? entries.slice(0, limit) : entries;
  const nextCursor = hasMore && resultEntries.length > 0
    ? resultEntries[resultEntries.length - 1]!.id
    : null;

  // Optionally compute total count
  let totalCount: number | undefined;
  if (options.includeTotalCount) {
    const countConditions = [eq(auditLogs.workspaceId, workspaceId)];
    if (options.filter?.action) {
      countConditions.push(eq(auditLogs.action, options.filter.action));
    }
    if (options.filter?.actorId) {
      countConditions.push(eq(auditLogs.actorId, options.filter.actorId));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(and(...countConditions));

    totalCount = countResult[0]?.count ?? 0;
  }

  return {
    entries: resultEntries,
    nextCursor,
    hasMore,
    totalCount,
  };
}

/**
 * Retrieves the most recent audit log entries for a workspace.
 * Convenience wrapper for dashboard widgets.
 */
export async function getRecentAuditActivity(
  db: Database,
  workspaceId: string,
  limit = 10,
): Promise<AuditLog[]> {
  return db.query.auditLogs.findMany({
    where: eq(auditLogs.workspaceId, workspaceId),
    orderBy: [desc(auditLogs.createdAt)],
    limit,
  });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Generates a compact 24-character hex ID. */
function generateId(): string {
  const { randomBytes } = require('node:crypto') as typeof import('node:crypto');
  return randomBytes(12).toString('hex');
}
