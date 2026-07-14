/**
 * @moolox/types — Canonical Shared Type Definitions
 *
 * Single source of truth for all cross-module TypeScript contracts,
 * Zod schemas, and domain types across the Moolox platform.
 *
 * Feature IDs: AST-001, TKN-001
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

// ---------------------------------------------------------------------------
// AST Engine Types (Feature: AST-001)
// ---------------------------------------------------------------------------
export {
  ASTNodeIdSchema,
  ASTNodeTypeSchema,
  ASTNodeSchema,
  ASTMutationPatchSchema,
  ASTPatchActionSchema,
  CRDTMetadataSchema,
} from './ast';

export type {
  ASTNodeId,
  ASTNodeType,
  IASTNode,
  ASTMutationPatch,
  ASTPatchAction,
  CRDTMetadata,
} from './ast';

// ---------------------------------------------------------------------------
// Design Token Types (Feature: TKN-001)
// ---------------------------------------------------------------------------
export {
  TokenValueSchema,
  TokenGroupSchema,
  W3CTokenMapSchema,
  TokenMetadataSchema,
  TokenDocumentSchema,
} from './tokens';

export type {
  TokenValue,
  ITokenGroup,
  IW3CTokenMap,
  TokenMetadata,
  TokenDocument,
} from './tokens';

// ---------------------------------------------------------------------------
// Shared Domain Types
// ---------------------------------------------------------------------------
export {
  ReleaseBucketSchema,
  WorkspaceRoleSchema,
  PlanTierSchema,
  AuthContextSchema,
  AgentIdSchema,
  AIIntentSchema,
  ViewportModeSchema,
  DeploymentStatusSchema,
} from './domain';

export type {
  ReleaseBucket,
  WorkspaceRole,
  PlanTier,
  IAuthContext,
  AgentId,
  AIIntent,
  IAgentContext,
  IAgentExecutor,
  ViewportMode,
  DeploymentStatus,
} from './domain';
