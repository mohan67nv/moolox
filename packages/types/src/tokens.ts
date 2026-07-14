/**
 * @moolox/types — W3C Design Token Schema (Feature ID: TKN-001)
 *
 * Strict JSON schema binding all visual properties to W3C Design Tokens format.
 * Token paths follow the convention: "category.group.name"
 * (e.g., "color.bg.primary", "space.8", "font.heading.xl").
 *
 * This schema enforces that all visual properties flow through the token
 * system — raw hex codes, magic pixel values, and ad-hoc CSS are forbidden
 * at the AST level (enforced by TKN-003 rule engine in Sprint 2).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// W3C Design Token Value Types
// ---------------------------------------------------------------------------

/** Individual design token value following W3C Design Tokens Community Group spec. */
export const TokenValueSchema = z.object({
  /** The resolved token value (e.g., "#1a1a2e", "16px", "Inter") */
  value: z.string().min(1, 'Token value must not be empty'),
  /** W3C token type classification */
  type: z.enum([
    'color',
    'dimension',
    'fontFamily',
    'fontWeight',
    'fontStyle',
    'duration',
    'cubicBezier',
    'number',
    'strokeStyle',
    'border',
    'transition',
    'shadow',
    'gradient',
    'typography',
    'letterSpacing',
    'lineHeight',
  ]),
  /** Optional human-readable description */
  description: z.string().optional(),
});

export type TokenValue = z.infer<typeof TokenValueSchema>;

// ---------------------------------------------------------------------------
// Token Group (Recursive — supports nested token hierarchies)
// ---------------------------------------------------------------------------

/**
 * A token group containing either direct token values or nested sub-groups.
 * Supports the W3C nested group pattern: color.bg.primary, color.bg.secondary, etc.
 */
export const TokenGroupSchema: z.ZodType<ITokenGroup> = z.lazy(() =>
  z.record(
    z.string(),
    z.union([TokenValueSchema, z.lazy(() => TokenGroupSchema)]),
  ),
);

export interface ITokenGroup {
  [key: string]: TokenValue | ITokenGroup;
}

// ---------------------------------------------------------------------------
// W3C Token Map — The Constitutional Design Law (TKN-001)
// ---------------------------------------------------------------------------

/**
 * IW3CTokenMap — The canonical design token map schema.
 *
 * Every Moolox project stores a `tokens.json` document conforming to this
 * schema. All visual properties in the AST (colors, spacing, typography)
 * must reference token paths from this map — never raw values.
 *
 * Required top-level groups:
 * - color:  Background, foreground, accent, semantic colors
 * - space:  Spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
 * - font:   Font families, sizes, weights, and line heights
 *
 * Optional top-level groups (added progressively):
 * - radius: Border radius scale
 * - shadow: Box shadow definitions
 * - border: Border style definitions
 * - motion: Animation durations and easing curves
 * - opacity: Opacity scale
 */
export const W3CTokenMapSchema = z
  .object({
    /** Color tokens — backgrounds, foregrounds, accents, semantics */
    color: TokenGroupSchema,
    /** Spacing tokens — margin, padding, gap values */
    space: TokenGroupSchema,
    /** Typography tokens — font families, sizes, weights */
    font: TokenGroupSchema,
  })
  .catchall(TokenGroupSchema);

export type IW3CTokenMap = z.infer<typeof W3CTokenMapSchema>;

// ---------------------------------------------------------------------------
// Token Metadata — Project-level token configuration
// ---------------------------------------------------------------------------

/** Schema version tracking for token format migrations. */
export const TokenMetadataSchema = z.object({
  /** Schema version (semver) */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must follow semver format'),
  /** Token map name (e.g., "Cyberpunk Dark", "Fintech Clean") */
  name: z.string().min(1),
  /** Active color mode */
  colorMode: z.enum(['light', 'dark', 'high-contrast']).default('dark'),
  /** Timestamp of last modification */
  updatedAt: z.number().int().positive(),
});

export type TokenMetadata = z.infer<typeof TokenMetadataSchema>;

/**
 * Complete token document stored in project_versions.tokens_json.
 * Wraps the W3C token map with metadata for versioning and theming.
 */
export const TokenDocumentSchema = z.object({
  /** Token format metadata */
  metadata: TokenMetadataSchema,
  /** The canonical W3C design token map */
  tokens: W3CTokenMapSchema,
});

export type TokenDocument = z.infer<typeof TokenDocumentSchema>;
