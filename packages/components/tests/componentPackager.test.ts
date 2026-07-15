/**
 * @moolox/components — Component Packaging & 1-Click Insertion Tests (`CMP-006`, `PRJ-006`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { ComponentPackagingEngine } from '../src/index';
import { type IASTNode } from '@moolox/types';

describe('ComponentPackagingEngine (`CMP-006`, `PRJ-006`)', () => {
  const sampleTree: IASTNode = {
    nodeId: 'node-11111111-2222-3333-4444-555555555555',
    type: 'CardBox',
    props: { title: 'Pricing Card' },
    styles: { 'background-color': 'colors.bg.main', 'text-color': 'colors.text.accent' },
    children: [
      {
        nodeId: 'node-22222222-3333-4444-5555-666666666666',
        type: 'Button',
        props: { label: 'Buy Now' },
        styles: { 'border-color': 'colors.border.primary' },
        children: [],
      },
    ],
  };

  const fullTokenCatalog = {
    colors: {
      bg: { main: '#0f172a' },
      text: { accent: '#38bdf8' },
      border: { primary: '#334155' },
      unused: { dark: '#000000' },
    },
  };

  it('packages component subtree and extracts exact referenced token subset (`CMP-006`)', () => {
    const manifest = ComponentPackagingEngine.packageComponent(
      'pkg-pricing-card-01',
      'Pricing Card Pro',
      sampleTree,
      fullTokenCatalog,
      'creator-dan'
    );

    expect(manifest.packageId).toBe('pkg-pricing-card-01');
    expect(manifest.title).toBe('Pricing Card Pro');
    expect(manifest.creatorId).toBe('creator-dan');
    expect(manifest.astTree.nodeId).toBe('node-11111111-2222-3333-4444-555555555555');

    // Should include referenced tokens
    expect(manifest.bundledTokens['colors.bg.main']).toBe('#0f172a');
    expect(manifest.bundledTokens['colors.text.accent']).toBe('#38bdf8');
    expect(manifest.bundledTokens['colors.border.primary']).toBe('#334155');

    // Should NOT include unreferenced tokens
    expect(manifest.bundledTokens['colors.unused.dark']).toBeUndefined();
  });

  it('unpacks manifest, performs N-1 ID remapping (`node-{uuid}`), and inserts cleanly (`PRJ-006`)', () => {
    const manifest = ComponentPackagingEngine.packageComponent(
      'pkg-01',
      'Pricing Card Pro',
      sampleTree,
      fullTokenCatalog
    );

    const targetProjectRoot: IASTNode = {
      nodeId: 'root',
      type: 'Page',
      props: {},
      styles: {},
      children: [
        {
          nodeId: 'node-target-container',
          type: 'Section',
          props: {},
          styles: {},
          children: [],
        },
      ],
    };

    const mergedTokens: Record<string, any> = {};
    const result = ComponentPackagingEngine.unpackAndInsert(
      manifest,
      targetProjectRoot,
      'node-target-container',
      (path, val) => {
        mergedTokens[path] = val;
      }
    );

    expect(result.success).toBe(true);
    expect(result.totalNodesInserted).toBe(2); // CardBox + Button
    expect(result.tokensMergedCount).toBe(3);
    expect(mergedTokens['colors.bg.main']).toBeDefined();

    const targetContainer = targetProjectRoot.children?.[0];
    expect(targetContainer?.children).toHaveLength(1);

    const insertedCard = targetContainer?.children?.[0];
    expect(insertedCard?.type).toBe('CardBox');
    // Ensure N-1 ID remapping generated fresh UUIDs
    expect(insertedCard?.nodeId).not.toBe('node-11111111-2222-3333-4444-555555555555');
    expect(insertedCard?.nodeId).toMatch(/^node-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    const insertedBtn = insertedCard?.children?.[0];
    expect(insertedBtn?.nodeId).not.toBe('node-22222222-3333-4444-5555-666666666666');
    expect(insertedBtn?.nodeId).toMatch(/^node-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
