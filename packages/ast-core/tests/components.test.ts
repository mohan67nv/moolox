/**
 * @moolox/ast-core — 11 Core Component Specifications Unit Tests (Feature: CMP-001)
 *
 * Validates that all 11 core components generate valid canonical `IASTNode` sub-trees
 * and obey the constitutional W3C / Zero-Hex design token requirements (`TKN-001`, `TKN-003`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { CORE_COMPONENTS_REGISTRY, getCoreComponentSpec } from '../src/components/coreSpecs';
import { ASTNodeSchema } from '@moolox/types';

describe('11 Built-In Core Component Specifications (CMP-001)', () => {
  it('CORE_COMPONENTS_REGISTRY contains exactly 11 canonical specifications', () => {
    expect(CORE_COMPONENTS_REGISTRY).toHaveLength(11);
    const ids = CORE_COMPONENTS_REGISTRY.map((spec) => spec.id);
    expect(ids).toContain('hero');
    expect(ids).toContain('navigation');
    expect(ids).toContain('pricing-table');
    expect(ids).toContain('feature-grid');
    expect(ids).toContain('testimonial-carousel');
    expect(ids).toContain('faq-accordion');
    expect(ids).toContain('contact-form');
    expect(ids).toContain('footer');
    expect(ids).toContain('cta-banner');
    expect(ids).toContain('blog-grid');
    expect(ids).toContain('team-matrix');
  });

  it('Every single component spec generates a valid canonical IASTNode tree matching Zod schema', () => {
    for (const spec of CORE_COMPONENTS_REGISTRY) {
      const testId = `node-${spec.id}-test-instance`;
      const nodeTree = spec.createNode(testId);

      // Verify node ID assignment
      expect(nodeTree.nodeId).toBe(testId);
      expect(nodeTree.type).toBeDefined();

      // Validate strict compliance with ASTNodeSchema
      const parseResult = ASTNodeSchema.safeParse(nodeTree);
      if (!parseResult.success) {
        throw new Error(`Component spec "${spec.id}" generated invalid AST node: ${parseResult.error.message}`);
      }
      expect(parseResult.success).toBe(true);
    }
  });

  it('All 11 core components strictly obey Zero-Hex Law (TKN-003) across all classNames and inline styles', () => {
    const rawHexRegex = /(?:^|[\s[("'])(#[0-9a-fA-F]{3,8})(?:[\s\])"']|$)/;

    for (const spec of CORE_COMPONENTS_REGISTRY) {
      const tree = spec.createNode();

      function scanForHex(node: any) {
        if (!node) return;
        const className = typeof node.props?.className === 'string' ? node.props.className : '';
        if (rawHexRegex.test(className)) {
          throw new Error(`Component spec "${spec.id}" violated Zero-Hex Law in className: "${className}"`);
        }

        if (node.styles && typeof node.styles === 'object') {
          for (const [key, val] of Object.entries(node.styles)) {
            if (typeof val === 'string' && rawHexRegex.test(val)) {
              throw new Error(`Component spec "${spec.id}" violated Zero-Hex Law in style.${key}: "${val}"`);
            }
          }
        }

        if (node.children) {
          for (const child of node.children) {
            scanForHex(child);
          }
        }
      }

      expect(() => scanForHex(tree)).not.toThrow();
    }
  });

  it('getCoreComponentSpec retrieves specific component factory accurately', () => {
    const hero = getCoreComponentSpec('hero');
    expect(hero).toBeDefined();
    expect(hero?.title).toBe('Hero Section');
    expect(hero?.category).toBe('marketing');
  });
});
