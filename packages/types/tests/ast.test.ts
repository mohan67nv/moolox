/**
 * @moolox/types — AST Node Schema Tests (Feature: AST-001)
 *
 * Validates IASTNode and ASTMutationPatch Zod schemas against
 * valid and invalid payloads, ensuring 100% schema contract enforcement.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import {
  ASTNodeIdSchema,
  ASTNodeSchema,
  ASTMutationPatchSchema,
  CRDTMetadataSchema,
  type IASTNode,
} from '../src/index';

// ---------------------------------------------------------------------------
// ASTNodeId Validation
// ---------------------------------------------------------------------------

describe('ASTNodeIdSchema', () => {
  it('accepts valid node IDs', () => {
    expect(ASTNodeIdSchema.parse('node-abc123')).toBe('node-abc123');
    expect(ASTNodeIdSchema.parse('node-550e8400-e29b-41d4-a716-446655440000')).toBeTruthy();
    expect(ASTNodeIdSchema.parse('node-hero-1')).toBe('node-hero-1');
  });

  it('rejects empty strings', () => {
    expect(() => ASTNodeIdSchema.parse('')).toThrow();
  });

  it('rejects IDs without "node-" prefix', () => {
    expect(() => ASTNodeIdSchema.parse('abc123')).toThrow();
    expect(() => ASTNodeIdSchema.parse('element-123')).toThrow();
  });

  it('rejects IDs with uppercase characters', () => {
    expect(() => ASTNodeIdSchema.parse('node-ABC')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// IASTNode Schema Validation
// ---------------------------------------------------------------------------

describe('ASTNodeSchema', () => {
  const validLeafNode: IASTNode = {
    nodeId: 'node-leaf-1',
    type: 'p',
    props: { className: 'text-lg' },
    styles: { 'color.text.primary': 'color.text.primary' },
  };

  const validTreeNode: IASTNode = {
    nodeId: 'node-section-1',
    type: 'section',
    props: { id: 'hero' },
    styles: { 'color.bg.primary': 'color.bg.primary', 'space.padding': 'space.8' },
    children: [
      {
        nodeId: 'node-heading-1',
        type: 'h1',
        props: { className: 'font-bold' },
        styles: { 'font.heading.xl': 'font.heading.xl' },
        children: [],
      },
      validLeafNode,
    ],
  };

  it('parses a valid leaf node (no children)', () => {
    const result = ASTNodeSchema.parse(validLeafNode);
    expect(result.nodeId).toBe('node-leaf-1');
    expect(result.type).toBe('p');
    expect(result.children).toBeUndefined();
  });

  it('parses a valid tree node with children', () => {
    const result = ASTNodeSchema.parse(validTreeNode);
    expect(result.nodeId).toBe('node-section-1');
    expect(result.children).toHaveLength(2);
    expect(result.children![0]!.nodeId).toBe('node-heading-1');
  });

  it('parses a node with CRDT metadata (future v2.0 hook)', () => {
    const nodeWithCRDT: IASTNode = {
      ...validLeafNode,
      crdtMetadata: {
        versionVector: { 'user-1': 5, 'user-2': 3 },
        lastModifiedBy: 'user-1',
        lockedBy: 'user-1',
      },
    };
    const result = ASTNodeSchema.parse(nodeWithCRDT);
    expect(result.crdtMetadata?.lastModifiedBy).toBe('user-1');
    expect(result.crdtMetadata?.lockedBy).toBe('user-1');
  });

  it('accepts empty props and styles', () => {
    const minimal: IASTNode = {
      nodeId: 'node-minimal-1',
      type: 'div',
      props: {},
      styles: {},
    };
    expect(ASTNodeSchema.parse(minimal)).toBeTruthy();
  });

  it('rejects nodes missing required fields', () => {
    expect(() => ASTNodeSchema.parse({ type: 'div', props: {}, styles: {} })).toThrow();
    expect(() => ASTNodeSchema.parse({ nodeId: 'node-x', props: {}, styles: {} })).toThrow();
  });

  it('rejects invalid nodeId format', () => {
    expect(() =>
      ASTNodeSchema.parse({
        nodeId: 'invalid-format',
        type: 'div',
        props: {},
        styles: {},
      }),
    ).toThrow();
  });

  it('handles deeply nested trees (3+ levels)', () => {
    const deepTree: IASTNode = {
      nodeId: 'node-root',
      type: 'main',
      props: {},
      styles: {},
      children: [
        {
          nodeId: 'node-level-1',
          type: 'section',
          props: {},
          styles: {},
          children: [
            {
              nodeId: 'node-level-2',
              type: 'div',
              props: {},
              styles: {},
              children: [
                {
                  nodeId: 'node-level-3',
                  type: 'span',
                  props: { text: 'deep' },
                  styles: {},
                },
              ],
            },
          ],
        },
      ],
    };
    const result = ASTNodeSchema.parse(deepTree);
    expect(result.children![0]!.children![0]!.children![0]!.nodeId).toBe('node-level-3');
  });
});

// ---------------------------------------------------------------------------
// ASTMutationPatch Schema Validation
// ---------------------------------------------------------------------------

describe('ASTMutationPatchSchema', () => {
  it('accepts valid mutation patches', () => {
    const patch = {
      targetNodeId: 'node-hero-1',
      action: 'UPDATE_PROPS' as const,
      payload: { className: 'text-xl font-bold' },
      timestamp: Date.now(),
    };
    expect(ASTMutationPatchSchema.parse(patch)).toBeTruthy();
  });

  it('accepts all valid action types', () => {
    const actions = ['ADD_CHILD', 'REMOVE_NODE', 'UPDATE_PROPS', 'UPDATE_STYLES', 'REPLACE_SUBTREE'];
    for (const action of actions) {
      expect(
        ASTMutationPatchSchema.parse({
          targetNodeId: 'node-test',
          action,
          payload: null,
          timestamp: 1700000000000,
        }),
      ).toBeTruthy();
    }
  });

  it('rejects invalid action types', () => {
    expect(() =>
      ASTMutationPatchSchema.parse({
        targetNodeId: 'node-test',
        action: 'INVALID_ACTION',
        payload: null,
        timestamp: Date.now(),
      }),
    ).toThrow();
  });

  it('rejects negative timestamps', () => {
    expect(() =>
      ASTMutationPatchSchema.parse({
        targetNodeId: 'node-test',
        action: 'UPDATE_PROPS',
        payload: {},
        timestamp: -1,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// CRDTMetadata Schema Validation
// ---------------------------------------------------------------------------

describe('CRDTMetadataSchema', () => {
  it('accepts valid CRDT metadata', () => {
    const metadata = {
      versionVector: { 'user-a': 1, 'user-b': 2 },
      lastModifiedBy: 'user-a',
    };
    expect(CRDTMetadataSchema.parse(metadata)).toBeTruthy();
  });

  it('accepts metadata with optional lockedBy', () => {
    const metadata = {
      versionVector: { 'user-a': 1 },
      lastModifiedBy: 'user-a',
      lockedBy: 'user-a',
    };
    const result = CRDTMetadataSchema.parse(metadata);
    expect(result.lockedBy).toBe('user-a');
  });

  it('accepts metadata without lockedBy', () => {
    const metadata = {
      versionVector: {},
      lastModifiedBy: 'user-a',
    };
    const result = CRDTMetadataSchema.parse(metadata);
    expect(result.lockedBy).toBeUndefined();
  });
});
