/**
 * @moolox/ast-core — Sub-Tree Structural Diffing & Patching Engine (AST-003)
 *
 * Precision mutation engine computing minimal delta patches (`ASTMutationPatch`)
 * when elements are modified. Immutably applies patches (`applyPatch`) without
 * cloning or re-parsing untouched branches (`< 15ms live canvas sync`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import {
  type IASTNode,
  type ASTMutationPatch,
  type ASTPatchAction,
  ASTMutationPatchSchema,
} from '@moolox/types';

/**
 * Computes minimal structural and property delta patches between `oldTree` and `newTree`.
 */
export function computePatch(oldTree: IASTNode, newTree: IASTNode): ASTMutationPatch[] {
  if (!oldTree || !newTree) {
    throw new Error('computePatch requires both oldTree and newTree to be defined.');
  }

  const patches: ASTMutationPatch[] = [];

  // 1. If root type or nodeId changed completely, emit REPLACE_SUBTREE
  if (oldTree.nodeId !== newTree.nodeId || oldTree.type !== newTree.type) {
    patches.push(
      createPatch(oldTree.nodeId, 'REPLACE_SUBTREE', {
        replacement: newTree,
      }),
    );
    return patches;
  }

  // 2. Diff props
  if (!deepEqual(oldTree.props, newTree.props)) {
    patches.push(
      createPatch(oldTree.nodeId, 'UPDATE_PROPS', {
        props: newTree.props,
      }),
    );
  }

  // 3. Diff styles
  if (!deepEqual(oldTree.styles, newTree.styles)) {
    patches.push(
      createPatch(oldTree.nodeId, 'UPDATE_STYLES', {
        styles: newTree.styles,
      }),
    );
  }

  // 4. Diff children
  const oldChildren = oldTree.children || [];
  const newChildren = newTree.children || [];

  const oldChildMap = new Map<string, IASTNode>();
  for (const child of oldChildren) {
    oldChildMap.set(child.nodeId, child);
  }

  const newChildMap = new Map<string, IASTNode>();
  for (const child of newChildren) {
    newChildMap.set(child.nodeId, child);
  }

  // Check for deleted children
  for (const oldChild of oldChildren) {
    if (!newChildMap.has(oldChild.nodeId)) {
      patches.push(
        createPatch(oldTree.nodeId, 'REMOVE_NODE', {
          childId: oldChild.nodeId,
        }),
      );
    }
  }

  // Check for added children or recursive diffs on existing children
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]!;
    const oldChild = oldChildMap.get(newChild.nodeId);

    if (!oldChild) {
      // Added new child
      patches.push(
        createPatch(oldTree.nodeId, 'ADD_CHILD', {
          child: newChild,
          index: i,
        }),
      );
    } else {
      // Existing child — recursively compute patches
      const childPatches = computePatch(oldChild, newChild);
      if (childPatches.length > 0) {
        patches.push(...childPatches);
      }
    }
  }

  return patches;
}

/**
 * Immutably applies one or more delta patches (`ASTMutationPatch`) to an existing `IASTNode` tree.
 * Untouched sub-trees retain their original JS object references (`essential for React memoization & 60fps canvas`).
 */
export function applyPatch(tree: IASTNode, patchOrPatches: ASTMutationPatch | ASTMutationPatch[]): IASTNode {
  if (!tree) {
    throw new Error('applyPatch requires a target IASTNode tree.');
  }

  if (Array.isArray(patchOrPatches)) {
    return patchOrPatches.reduce((currentTree, patch) => applySinglePatch(currentTree, patch), tree);
  }

  return applySinglePatch(tree, patchOrPatches);
}

/**
 * Applies a single `ASTMutationPatch` immutably.
 */
function applySinglePatch(tree: IASTNode, patch: ASTMutationPatch): IASTNode {
  const { targetNodeId, action, payload } = patch;

  return applyPatchRecursive(tree, targetNodeId, action, payload);
}

function applyPatchRecursive(
  node: IASTNode,
  targetNodeId: string,
  action: ASTPatchAction,
  payload: unknown,
): IASTNode {
  // If this node is the direct target of the patch
  if (node.nodeId === targetNodeId) {
    switch (action) {
      case 'UPDATE_PROPS': {
        const payloadObj = payload as { props?: Record<string, unknown> } | Record<string, unknown>;
        const newProps = 'props' in (payloadObj || {}) ? (payloadObj as { props: Record<string, unknown> }).props : payloadObj;
        return {
          ...node,
          props: { ...node.props, ...(newProps as Record<string, unknown>) },
        };
      }
      case 'UPDATE_STYLES': {
        const payloadObj = payload as { styles?: Record<string, string> } | Record<string, string>;
        const newStyles = 'styles' in (payloadObj || {}) ? (payloadObj as { styles: Record<string, string> }).styles : payloadObj;
        return {
          ...node,
          styles: { ...node.styles, ...(newStyles as Record<string, string>) },
        };
      }
      case 'ADD_CHILD': {
        const payloadObj = payload as { child?: IASTNode; index?: number } | IASTNode;
        const childToAdd = 'child' in (payloadObj || {}) ? (payloadObj as { child: IASTNode }).child : (payloadObj as IASTNode);
        const insertIndex = 'index' in (payloadObj || {}) ? (payloadObj as { index?: number }).index : undefined;

        const currentChildren = node.children ? [...node.children] : [];
        if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= currentChildren.length) {
          currentChildren.splice(insertIndex, 0, childToAdd);
        } else {
          currentChildren.push(childToAdd);
        }

        return {
          ...node,
          children: currentChildren,
        };
      }
      case 'REMOVE_NODE': {
        const payloadObj = payload as { childId?: string } | null;
        if (payloadObj && payloadObj.childId && node.children) {
          const filtered = node.children.filter((c) => c.nodeId !== payloadObj.childId);
          return {
            ...node,
            children: filtered,
          };
        }
        // If targetNodeId itself is being removed when reached via child traversal below, handled by parent checks
        return node;
      }
      case 'REPLACE_SUBTREE': {
        const payloadObj = payload as { replacement?: IASTNode } | IASTNode;
        const replacement = 'replacement' in (payloadObj || {}) ? (payloadObj as { replacement: IASTNode }).replacement : (payloadObj as IASTNode);
        return replacement;
      }
      default:
        return node;
    }
  }

  // If this node has children, check if any child is being removed or needs recursive patching
  if (node.children && node.children.length > 0) {
    // If REMOVE_NODE targets a child of this node directly (`targetNodeId === child.nodeId` without specifying parent)
    if (action === 'REMOVE_NODE') {
      const isTargetChild = node.children.some((c) => c.nodeId === targetNodeId);
      if (isTargetChild) {
        return {
          ...node,
          children: node.children.filter((c) => c.nodeId !== targetNodeId),
        };
      }
    }

    let hasChangedChild = false;
    const newChildren = node.children.map((child) => {
      const updatedChild = applyPatchRecursive(child, targetNodeId, action, payload);
      if (updatedChild !== child) {
        hasChangedChild = true;
      }
      return updatedChild;
    });

    if (hasChangedChild) {
      return {
        ...node,
        children: newChildren,
      };
    }
  }

  return node;
}

/**
 * Finds an AST node by its `nodeId` within a tree (`O(n)` traversal).
 */
export function findNodeById(tree: IASTNode, nodeId: string): IASTNode | null {
  if (!tree || !nodeId) return null;
  if (tree.nodeId === nodeId) return tree;

  if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Replaces an AST node matching `targetId` with `replacement` (`O(n)` immutable traversal).
 * If `replacement` is null, removes the node from its parent.
 */
export function replaceNodeById(tree: IASTNode, targetId: string, replacement: IASTNode | null): IASTNode {
  if (!tree || !targetId) return tree;
  if (tree.nodeId === targetId) {
    return replacement || tree;
  }

  if (tree.children) {
    let changed = false;
    const newChildren: IASTNode[] = [];

    for (const child of tree.children) {
      if (child.nodeId === targetId) {
        changed = true;
        if (replacement !== null) {
          newChildren.push(replacement);
        }
      } else {
        const updatedChild = replaceNodeById(child, targetId, replacement);
        if (updatedChild !== child) changed = true;
        newChildren.push(updatedChild);
      }
    }

    if (changed) {
      return {
        ...tree,
        children: newChildren,
      };
    }
  }

  return tree;
}

/** Helper to create validated ASTMutationPatch */
function createPatch(targetNodeId: string, action: ASTPatchAction, payload: unknown): ASTMutationPatch {
  return ASTMutationPatchSchema.parse({
    targetNodeId,
    action,
    payload,
    timestamp: Date.now(),
  });
}

/** Deep object equality helper */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}
