/**
 * @moolox/types — Shared Domain Types
 *
 * Cross-cutting domain types used across multiple packages.
 * Includes workspace roles, release buckets, plan tiers,
 * and progressive interface contracts.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { z } from 'zod';
import type { IASTNode } from './ast';
import type { ASTMutationPatch } from './ast';

// ---------------------------------------------------------------------------
// Release Buckets — Progressive Delivery Model
// ---------------------------------------------------------------------------

/** Staged release bucket for progressive feature activation. */
export const ReleaseBucketSchema = z.enum([
  'v0.5_Alpha',
  'v1.0_Public',
  'v1.5_Polish',
  'v2.0_Ecosystem',
  'v3.0_Enterprise',
  'Platform',
  'Future',
]);

export type ReleaseBucket = z.infer<typeof ReleaseBucketSchema>;

// ---------------------------------------------------------------------------
// Workspace Roles — RBAC Authorization
// ---------------------------------------------------------------------------

/** Role-based access control roles for workspace members. */
export const WorkspaceRoleSchema = z.enum([
  'owner',
  'admin',
  'editor',
  'viewer',
  'client_editor',
]);

export type WorkspaceRole = z.infer<typeof WorkspaceRoleSchema>;

// ---------------------------------------------------------------------------
// Subscription Plan Tiers
// ---------------------------------------------------------------------------

/** Subscription plan tiers gating feature access. */
export const PlanTierSchema = z.enum(['free', 'pro', 'agency', 'enterprise']);

export type PlanTier = z.infer<typeof PlanTierSchema>;

// ---------------------------------------------------------------------------
// Auth Context — Edge JWT Payload
// ---------------------------------------------------------------------------

/** Authenticated user context extracted from edge JWT middleware. */
export const AuthContextSchema = z.object({
  /** Clerk user sub UUID */
  userId: z.string().min(1),
  /** User email address */
  email: z.string().email(),
  /** Active workspace ID (if within a workspace context) */
  activeWorkspaceId: z.string().optional(),
  /** User's role within the active workspace */
  role: WorkspaceRoleSchema.optional(),
});

export type IAuthContext = z.infer<typeof AuthContextSchema>;

// ---------------------------------------------------------------------------
// AI Agent Interfaces — Progressive Orchestration (Preserved Day 1)
// ---------------------------------------------------------------------------

/** Canonical agent identifiers across the 12-agent orchestration pipeline. */
export const AgentIdSchema = z.enum([
  'ROUTER',
  'GENERATOR',
  'STATIC_LINTER',
  'PLANNER',
  'LAYOUT',
  'UX',
  'COPY',
  'SEO',
  'A11Y',
  'PERF',
  'SECURITY',
  'REVIEWER',
]);

export type AgentId = z.infer<typeof AgentIdSchema>;

/** AI intent classification categories from the Haiku router. */
export const AIIntentSchema = z.enum([
  'CREATE_SECTION',
  'UPDATE_LAYOUT_AND_STYLE',
  'REFACTOR_COPY',
  'FIX_A11Y',
  'OPTIMIZE_PERFORMANCE',
  'GENERATE_FROM_IMAGE',
]);

export type AIIntent = z.infer<typeof AIIntentSchema>;

/**
 * Agent execution context — input to every agent in the pipeline.
 * Preserved for all 12 agents from Day 1; v0.5 routes only to Core 3.
 */
export interface IAgentContext {
  workspaceId: string;
  projectId: string;
  activeTokens: Record<string, unknown>;
  targetSubTree: IASTNode;
  userPrompt: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Agent executor contract — every agent implements this interface.
 * Progressive: v0.5 activates ROUTER, GENERATOR, STATIC_LINTER only.
 */
export interface IAgentExecutor {
  agentId: AgentId;
  releaseBucket: ReleaseBucket;
  execute(context: IAgentContext): Promise<{
    patch: ASTMutationPatch | null;
    diagnostics: Array<{ level: 'error' | 'warn'; message: string; ruleId: string }>;
    tokensUsed: number;
  }>;
}

// ---------------------------------------------------------------------------
// Canvas Viewport Types
// ---------------------------------------------------------------------------

/** Viewport mode for responsive canvas rendering. */
export const ViewportModeSchema = z.enum(['mobile', 'tablet', 'desktop', 'ultrawide']);

export type ViewportMode = z.infer<typeof ViewportModeSchema>;

// ---------------------------------------------------------------------------
// Deployment Status
// ---------------------------------------------------------------------------

/** Edge deployment lifecycle status. */
export const DeploymentStatusSchema = z.enum(['building', 'live', 'failed', 'rolled_back']);

export type DeploymentStatus = z.infer<typeof DeploymentStatusSchema>;
