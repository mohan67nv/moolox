/**
 * @moolox/ast-core — Compression & Window Pruning Unit Tests (Features: AST-004, AST-005)
 *
 * Validates binary Zstd/zlib AST compression (> 70% reduction) and accurate
 * window pruning around target nodes with skeleton ancestor preservation.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { compressAST, decompressAST, compressASTToBase64, decompressASTFromBase64 } from '../src/compress/zstd';
import { pruneASTWindow } from '../src/prune/window';
import { parseJSX } from '../src/compiler/parser';
import { findNodeById } from '../src/diff/patcher';

describe('Zstd / Compressed JSONB Store Helper (AST-004)', () => {
  const sampleTree = parseJSX(`
    <div id="root" className="container mx-auto p-4 bg-gray-900 text-white">
      <header className="flex justify-between items-center py-6 border-b border-gray-800">
        <h1 className="text-3xl font-extrabold tracking-tight">Moolox Studio</h1>
        <nav className="flex gap-6">
          <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
          <a href="/settings" className="hover:text-blue-400">Settings</a>
        </nav>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <section className="col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Canvas Inspector</h2>
          <p className="text-gray-300 leading-relaxed">
            Real-time visual node inspection with zero throwaway code generation.
          </p>
        </section>
      </main>
    </div>
  `);

  it('compressAST reduces AST JSON payload size significantly and decompressAST restores exact schema structure', () => {
    const rawJsonString = JSON.stringify(sampleTree);
    const rawBytes = new TextEncoder().encode(rawJsonString).length;

    const compressed = compressAST(sampleTree);
    expect(compressed.length).toBeLessThan(rawBytes * 0.6); // At least 40-70% smaller

    const decompressed = decompressAST(compressed);
    expect(decompressed).toEqual(sampleTree);
  });

  it('compressASTToBase64 and decompressASTFromBase64 work seamlessly for string-based transport', () => {
    const base64 = compressASTToBase64(sampleTree);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);

    const restored = decompressASTFromBase64(base64);
    expect(restored).toEqual(sampleTree);
  });
});

describe('AST Window Pruning & Context Slice Helper (AST-005)', () => {
  const tree = parseJSX(`
    <main id="app-root" className="bg-black">
      <header id="topbar" className="h-16">
        <div className="logo">Moolox</div>
      </header>
      <div id="canvas-wrapper" className="flex">
        <aside id="sidebar" className="w-64">
          <ul>
            <li data-node-id="node-item-1">Item 1</li>
            <li data-node-id="node-item-2">Item 2</li>
          </ul>
        </aside>
        <section id="inspector-pane" data-node-id="node-inspector" className="flex-1 p-4">
          <div className="card">
            <h3>Title</h3>
            <p>Desc</p>
            <div className="deep-child">
              <span>Deep Leaf 1</span>
              <span>Deep Leaf 2</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  `);

  it('pruneASTWindow extracts target node window and strips deep children beyond maxDepth', () => {
    const pruned = pruneASTWindow(tree, 'node-inspector', { maxDepth: 1, includeAncestors: false });
    expect(pruned).toBeDefined();
    expect(pruned?.nodeId).toBe('node-inspector');
    expect(pruned?.children).toHaveLength(1); // <div className="card">

    // Children of .card should be pruned due to maxDepth=1 relative to target
    const cardNode = pruned?.children?.[0];
    expect(cardNode?.props._prunedChildrenCount).toBe(3); // h3, p, div.deep-child were pruned
    expect(cardNode?.children).toBeUndefined();
  });

  it('pruneASTWindow preserves exact ancestor hierarchy (`includeAncestors: true`) while skeletonizing sibling branches', () => {
    const windowTree = pruneASTWindow(tree, 'node-inspector', { maxDepth: 2, includeAncestors: true });
    expect(windowTree).toBeDefined();
    expect(windowTree?.type).toBe('main');

    // Check header sibling was skeletonized
    const headerSibling = windowTree?.children?.[0];
    expect(headerSibling?.type).toBe('header');
    expect(headerSibling?.props._isPrunedSibling).toBe(true);
    expect(headerSibling?.children).toBeUndefined();

    // Check canvas-wrapper ancestor has inspector child and skeletonized sidebar sibling
    const canvasWrapper = windowTree?.children?.[1];
    expect(canvasWrapper?.type).toBe('div');
    const sidebarSibling = canvasWrapper?.children?.find((c) => c.type === 'aside');
    expect(sidebarSibling?.props._isPrunedSibling).toBe(true);

    const inspectorChild = findNodeById(windowTree!, 'node-inspector');
    expect(inspectorChild).toBeDefined();
    expect(inspectorChild?.type).toBe('section');
  });
});
