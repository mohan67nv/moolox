/**
 * @moolox/types — AST Node Schema (Feature ID: AST-001)
 *
 * Unified JSONB AST Node Schema — the canonical, version-controlled tree
 * structure representing clean Next.js/React DOM trees.
 *
 * Every visual element in the Moolox canvas is represented as an IASTNode.
 * Styles are strictly bound to tokens.json keys (never raw hex/px values).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitive Types
// ---------------------------------------------------------------------------

/**
 * Immutable unique identifier for every AST node.
 * Format: "node-{uuid}" — stable across saves, serialization, and CRDT sync.
 */
export const ASTNodeIdSchema = z
  .string()
  .min(1, 'ASTNodeId must not be empty')
  .regex(/^node-[a-z0-9-]+$/, 'ASTNodeId must follow "node-{uuid}" format');

export type ASTNodeId = z.infer<typeof ASTNodeIdSchema>;

/**
 * Supported AST node types — HTML elements and custom Moolox components.
 */
export const ASTNodeTypeSchema = z.string().min(1, 'Node type must not be empty');

export type ASTNodeType = z.infer<typeof ASTNodeTypeSchema>;

// ---------------------------------------------------------------------------
// CRDT Metadata (Preserved for v2.0 Multiplayer — Progressive Architecture)
// ---------------------------------------------------------------------------

/**
 * Future CRDT collaboration hook preserved from Day 1.
 * Allows Yjs real-time multiplayer without structural refactoring.
 * Set to undefined until COL-001 activates in Sprint 9.
 */
export const CRDTMetadataSchema = z.object({
  /** Yjs version vector for conflict-free convergence */
  versionVector: z.record(z.string(), z.number()),
  /** User ID of the last modifier */
  lastModifiedBy: z.string(),
  /** Optional: user ID currently holding an exclusive edit lock */
  lockedBy: z.string().optional(),
});

export type CRDTMetadata = z.infer<typeof CRDTMetadataSchema>;

// ---------------------------------------------------------------------------
// AST Mutation Patch
// ---------------------------------------------------------------------------

/** Supported mutation actions for AST delta patching (AST-003). */
export const ASTPatchActionSchema = z.enum([
  'ADD_CHILD',
  'REMOVE_NODE',
  'UPDATE_PROPS',
  'UPDATE_STYLES',
  'REPLACE_SUBTREE',
]);

export type ASTPatchAction = z.infer<typeof ASTPatchActionSchema>;

/**
 * Minimal delta payload emitted by computePatch when AST nodes mutate.
 * Serialized as JSON and streamed via SSE to the canvas.
 */
export const ASTMutationPatchSchema = z.object({
  /** Target node to apply the mutation to */
  targetNodeId: ASTNodeIdSchema,
  /** Type of mutation */
  action: ASTPatchActionSchema,
  /** Action-specific payload (props, styles, child nodes, etc.) */
  payload: z.unknown(),
  /** Unix timestamp in milliseconds */
  timestamp: z.number().int().positive(),
});

export type ASTMutationPatch = z.infer<typeof ASTMutationPatchSchema>;

// ---------------------------------------------------------------------------
// Core AST Node — The Canonical Tree Structure (AST-001)
// ---------------------------------------------------------------------------

/**
 * IASTNode — The canonical AST node schema.
 *
 * Every element in the Moolox visual canvas is represented as this recursive
 * tree structure. Props hold React component properties, styles hold
 * design-token-bound CSS values (never raw hex/px).
 *
 * This is a recursive schema using z.lazy() for the children array.
 */
export const ASTNodeSchema: z.ZodType<IASTNode> = z.lazy(() =>
  z.object({
    /** Immutable UUID — stable across saves, serialization, and CRDT sync */
    nodeId: ASTNodeIdSchema,

    /** HTML element or custom component type */
    type: ASTNodeTypeSchema,

    /** React component props (className, href, src, alt, etc.) */
    props: z.record(z.string(), z.unknown()),

    /**
     * Design-token-bound style values.
     * Keys are token paths (e.g., "color.bg.primary", "space.8").
     * Raw hex codes (#FF0000) or magic pixel values are forbidden.
     */
    styles: z.record(z.string(), z.string()),

    /** Ordered child nodes forming the recursive tree */
    children: z.array(z.lazy(() => ASTNodeSchema)).optional(),

    /**
     * CRDT metadata — preserved for v2.0 multiplayer activation.
     * Undefined in v0.5/v1.0 (single-editor mode).
     */
    crdtMetadata: CRDTMetadataSchema.optional(),
  }),
);

/**
 * The canonical IASTNode interface derived from the Zod schema.
 * Used across all packages for type-safe AST manipulation.
 */
export interface IASTNode {
  nodeId: string;
  type: string;
  props: Record<string, unknown>;
  styles: Record<string, string>;
  children?: IASTNode[];
  crdtMetadata?: CRDTMetadata;
}
