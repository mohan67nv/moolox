/**
 * @moolox/ast-core — 1-Click Component Insertion Engine (CMP-003)
 *
 * Provides factory helpers to append or insert any of the 11 canonical core
 * component specifications (`CMP-001`) into an existing `IASTNode` tree or emit
 * structural `ASTMutationPatch` operations (`ADD_CHILD`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import crypto from 'node:crypto';
import { type IASTNode, type ASTMutationPatch } from '@moolox/types';
import { getCoreComponentSpec, type ComponentSpec } from './coreSpecs';

/**
 * Creates an `ASTMutationPatch` of type `ADD_CHILD` for inserting a fresh
 * instance of a core component (`hero`, `pricing-table`, etc.) under `targetId`.
 */
export function createInsertChildPatch(
  targetNodeId: string,
  specId: string,
  index?: number,
): ASTMutationPatch {
  const spec = getCoreComponentSpec(specId);
  if (!spec) {
    throw new Error(`Component specification not found for id: "${specId}"`);
  }

  const uniqueId = `node-${spec.id}-${crypto.randomUUID().slice(0, 8)}`;
  const freshNode = spec.createNode(uniqueId);

  return {
    targetNodeId,
    action: 'ADD_CHILD',
    payload: {
      node: freshNode,
      index,
    },
    timestamp: Date.now(),
  };
}

/**
 * Recursively inserts a child node into an `IASTNode` tree under `targetId`.
 * Returns the mutated new root `IASTNode` tree or `null` if target wasn't found.
 */
export function appendChildToASTNode(
  root: IASTNode,
  targetId: string,
  childNode: IASTNode,
  index?: number,
): IASTNode | null {
  if (root.nodeId === targetId) {
    const existingChildren = root.children ? [...root.children] : [];
    if (typeof index === 'number' && index >= 0 && index <= existingChildren.length) {
      existingChildren.splice(index, 0, childNode);
    } else {
      existingChildren.push(childNode);
    }
    return {
      ...root,
      children: existingChildren,
    };
  }

  if (root.children && root.children.length > 0) {
    let mutated = false;
    const newChildren = root.children.map((c) => {
      const res = appendChildToASTNode(c, targetId, childNode, index);
      if (res) {
        mutated = true;
        return res;
      }
      return c;
    });

    if (mutated) {
      return {
        ...root,
        children: newChildren,
      };
    }
  }

  return null;
}

/**
 * 1-Click insertion helper: creates the component node, inserts it under `targetId`
 * in `root`, and returns both the new tree and the emitted patch operation (`CMP-003`).
 */
export function insertComponentIntoAST(
  root: IASTNode,
  targetId: string,
  specId: string,
  index?: number,
): { newTree: IASTNode; patch: ASTMutationPatch; insertedNode: IASTNode } {
  const patch = createInsertChildPatch(targetId, specId, index);
  const insertedNode = (patch.payload as any).node as IASTNode;

  const newTree = appendChildToASTNode(root, targetId, insertedNode, index);
  if (!newTree) {
    throw new Error(`Target container node not found in AST tree: "${targetId}"`);
  }

  return {
    newTree,
    patch,
    insertedNode,
  };
}
