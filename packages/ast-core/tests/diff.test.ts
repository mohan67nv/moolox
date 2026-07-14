/**
 * @moolox/ast-core — Sub-Tree Diffing & Patching Unit Tests (Feature: AST-003)
 *
 * Validates minimal delta patch computation (`UPDATE_PROPS`, `UPDATE_STYLES`, `ADD_CHILD`,
 * `REMOVE_NODE`, `REPLACE_SUBTREE`) and immutable application without cloning untouched sub-trees.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { computePatch, applyPatch, findNodeById, replaceNodeById } from '../src/diff/patcher';
import { parseJSX } from '../src/compiler/parser';
import { type IASTNode, ASTMutationPatchSchema } from '@moolox/types';

describe('Sub-Tree Structural Diffing & Patching Engine (AST-003)', () => {
  const baseCode = `
    <section id="hero" className="p-8 bg-black">
      <h1 data-node-id="node-title" className="text-4xl">Title</h1>
      <p data-node-id="node-desc" className="text-gray-400">Description</p>
    </section>
  `;

  it('computePatch detects property changes (`UPDATE_PROPS`)', () => {
    const oldTree = parseJSX(baseCode);
    const newTree = parseJSX(`
      <section id="hero-updated" className="p-8 bg-black">
        <h1 data-node-id="node-title" className="text-4xl">Title</h1>
        <p data-node-id="node-desc" className="text-gray-400">Description</p>
      </section>
    `);

    const patches = computePatch(oldTree, newTree);
    expect(patches).toHaveLength(1);
    expect(patches[0]?.action).toBe('UPDATE_PROPS');
    expect(patches[0]?.targetNodeId).toBe(oldTree.nodeId);
    expect((patches[0]?.payload as { props: Record<string, unknown> }).props.id).toBe('hero-updated');
  });

  it('computePatch detects style/token changes (`UPDATE_STYLES`)', () => {
    const oldTree = parseJSX(baseCode);
    const newTree = parseJSX(`
      <section id="hero" className="p-12 bg-white">
        <h1 data-node-id="node-title" className="text-4xl">Title</h1>
        <p data-node-id="node-desc" className="text-gray-400">Description</p>
      </section>
    `);

    const patches = computePatch(oldTree, newTree);
    const stylePatch = patches.find((p) => p.action === 'UPDATE_STYLES');
    expect(stylePatch).toBeDefined();
    expect((stylePatch?.payload as { styles: Record<string, string> }).styles.className).toBe('p-12 bg-white');
  });

  it('computePatch detects added children (`ADD_CHILD`)', () => {
    const oldTree = parseJSX(baseCode);
    const newTree = parseJSX(`
      <section id="hero" className="p-8 bg-black">
        <h1 data-node-id="node-title" className="text-4xl">Title</h1>
        <p data-node-id="node-desc" className="text-gray-400">Description</p>
        <button data-node-id="node-cta" className="px-4 py-2">Click Me</button>
      </section>
    `);

    const patches = computePatch(oldTree, newTree);
    const addPatch = patches.find((p) => p.action === 'ADD_CHILD');
    expect(addPatch).toBeDefined();
    expect(addPatch?.targetNodeId).toBe(oldTree.nodeId);
    expect((addPatch?.payload as { child: IASTNode }).child.nodeId).toBe('node-cta');
  });

  it('computePatch detects deleted children (`REMOVE_NODE`)', () => {
    const oldTree = parseJSX(baseCode);
    const newTree = parseJSX(`
      <section id="hero" className="p-8 bg-black">
        <h1 data-node-id="node-title" className="text-4xl">Title</h1>
      </section>
    `);

    const patches = computePatch(oldTree, newTree);
    const removePatch = patches.find((p) => p.action === 'REMOVE_NODE');
    expect(removePatch).toBeDefined();
    expect(removePatch?.targetNodeId).toBe(oldTree.nodeId);
    expect((removePatch?.payload as { childId: string }).childId).toBe('node-desc');
  });

  it('applyPatch applies delta mutations immutably while preserving untouched child object references (`< 15ms sync`)', () => {
    const oldTree = parseJSX(baseCode);
    const start = performance.now();

    const patch = ASTMutationPatchSchema.parse({
      targetNodeId: 'node-desc',
      action: 'UPDATE_PROPS',
      payload: { props: { className: 'text-gray-200 font-semibold' } },
      timestamp: Date.now(),
    });

    const updatedTree = applyPatch(oldTree, patch);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(15); // Fast sub-tree patch
    expect(updatedTree).not.toBe(oldTree); // Root identity changed due to immutability

    // Verify title node reference was completely untouched (exact JS object equality)
    const oldTitle = findNodeById(oldTree, 'node-title');
    const newTitle = findNodeById(updatedTree, 'node-title');
    expect(newTitle).toBe(oldTitle);

    // Verify desc node was updated
    const newDesc = findNodeById(updatedTree, 'node-desc');
    expect(newDesc?.props.className).toBe('text-gray-200 font-semibold');
  });

  it('applyPatch handles ADD_CHILD and REMOVE_NODE accurately', () => {
    const oldTree = parseJSX(baseCode);

    // 1. Add CTA child
    const addPatch = ASTMutationPatchSchema.parse({
      targetNodeId: oldTree.nodeId,
      action: 'ADD_CHILD',
      payload: {
        child: {
          nodeId: 'node-cta',
          type: 'button',
          props: { className: 'btn-primary' },
          styles: {},
        },
      },
      timestamp: Date.now(),
    });

    const withButton = applyPatch(oldTree, addPatch);
    expect(withButton.children).toHaveLength(3);
    expect(findNodeById(withButton, 'node-cta')?.type).toBe('button');

    // 2. Remove Title child
    const removePatch = ASTMutationPatchSchema.parse({
      targetNodeId: withButton.nodeId,
      action: 'REMOVE_NODE',
      payload: { childId: 'node-title' },
      timestamp: Date.now(),
    });

    const withoutTitle = applyPatch(withButton, removePatch);
    expect(withoutTitle.children).toHaveLength(2);
    expect(findNodeById(withoutTitle, 'node-title')).toBeNull();
  });

  it('findNodeById and replaceNodeById traverse and mutate AST nodes accurately', () => {
    const tree = parseJSX(baseCode);
    const found = findNodeById(tree, 'node-desc');
    expect(found?.type).toBe('p');

    const replacement: IASTNode = {
      nodeId: 'node-desc',
      type: 'div',
      props: { className: 'custom-card' },
      styles: {},
    };

    const replaced = replaceNodeById(tree, 'node-desc', replacement);
    const check = findNodeById(replaced, 'node-desc');
    expect(check?.type).toBe('div');
    expect(check?.props.className).toBe('custom-card');
  });
});
