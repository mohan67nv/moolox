import { describe, it, expect } from 'vitest';
import { createInsertChildPatch, insertComponentIntoAST } from '../src/components/insertion';
import { type IASTNode } from '@moolox/types';

describe('CMP-003: 1-Click Component Insertion Engine', () => {
  const mockTree: IASTNode = {
    nodeId: 'node-root',
    type: 'div',
    props: { className: 'container' },
    children: [],
  };

  it('should create an ADD_CHILD patch with canonical node-{uuid} format', () => {
    const patch = createInsertChildPatch('node-root', 'pricing-table');
    expect(patch.action).toBe('ADD_CHILD');
    expect(patch.targetNodeId).toBe('node-root');

    const insertedNode = (patch.payload as any).node as IASTNode;
    expect(insertedNode.nodeId).toMatch(/^node-pricing-table-[0-9a-f-]+$/i);
    expect(insertedNode.type).toBe('section');
  });

  it('should insert a component into an existing tree and return patch cleanly', () => {
    const { newTree, patch, insertedNode } = insertComponentIntoAST(mockTree, 'node-root', 'hero');

    expect(newTree.children!.length).toBe(1);
    expect(newTree.children![0]!.nodeId).toBe(insertedNode.nodeId);
    expect(patch.action).toBe('ADD_CHILD');
  });

  it('should throw error if specification ID is not found', () => {
    expect(() => createInsertChildPatch('node-root', 'non-existent-component')).toThrow(
      'Component specification not found for id: "non-existent-component"',
    );
  });
});
