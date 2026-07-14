/**
 * @moolox/ast-core — AST Window Pruning & Context Slice Helper (AST-005)
 *
 * Extracts a localized sub-tree window around `targetNodeId` (`pruneASTWindow`).
 * Prunes deep children beyond `maxDepth` and strips irrelevant sibling branches
 * to minimize token consumption (`< 1,500 tokens`) during AI prompt turns (`ORC-002`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IASTNode, ASTNodeIdSchema } from '@moolox/types';
import { findNodeById } from '../diff/patcher';

/**
 * Options for window pruning.
 */
export interface PruneWindowOptions {
  /** Maximum depth of children to include below `targetNodeId` (`3` by default) */
  maxDepth?: number;
  /** Whether to include ancestor path (`true` by default) */
  includeAncestors?: boolean;
  /** Whether to strip cOMPONENT props/styles that aren't critical for AI layout edits (`false` by default) */
  stripNonEssentialProps?: boolean;
}

/**
 * Extracts a pruned sub-tree window centered around `targetNodeId`.
 * Returns the target node pruned to `maxDepth`, or if `includeAncestors` is true,
 * returns the root tree with all non-ancestor/non-target branches pruned.
 */
export function pruneASTWindow(
  rootTree: IASTNode,
  targetNodeId: string,
  options: PruneWindowOptions = {},
): IASTNode | null {
  if (!rootTree || !targetNodeId) {
    return null;
  }

  const maxDepth = options.maxDepth ?? 3;
  const includeAncestors = options.includeAncestors ?? true;

  // 1. Locate the target node inside the tree
  const targetNode = findNodeById(rootTree, targetNodeId);
  if (!targetNode) {
    return null;
  }

  // 2. Prune the target sub-tree up to maxDepth
  const prunedTarget = pruneNodeDepth(targetNode, 0, maxDepth, options.stripNonEssentialProps);

  if (!includeAncestors || rootTree.nodeId === targetNodeId) {
    return prunedTarget;
  }

  // 3. Reconstruct ancestor chain from root to targetNodeId, pruning all sibling branches
  return pruneAncestorTree(rootTree, targetNodeId, prunedTarget, options.stripNonEssentialProps);
}

/**
 * Prunes a node's children deeper than `maxDepth`.
 */
function pruneNodeDepth(
  node: IASTNode,
  currentDepth: number,
  maxDepth: number,
  stripProps?: boolean,
): IASTNode {
  const props = stripProps ? filterEssentialProps(node.props) : { ...node.props };
  const styles = { ...node.styles };

  if (currentDepth >= maxDepth) {
    // Reached max depth: replace children with summary metadata if children exist
    if (node.children && node.children.length > 0) {
      return {
        nodeId: node.nodeId,
        type: node.type,
        props: {
          ...props,
          _prunedChildrenCount: node.children.length,
        },
        styles,
      };
    }
    return {
      nodeId: node.nodeId,
      type: node.type,
      props,
      styles,
    };
  }

  const children = node.children
    ? node.children.map((child) => pruneNodeDepth(child, currentDepth + 1, maxDepth, stripProps))
    : undefined;

  return {
    nodeId: node.nodeId,
    type: node.type,
    props,
    styles,
    children,
  };
}

/**
 * Recursively rebuilds the ancestor path from `root` down to `targetNodeId`.
 * Sibling nodes along the ancestor path are replaced with summary skeleton nodes.
 */
function pruneAncestorTree(
  node: IASTNode,
  targetNodeId: string,
  prunedTarget: IASTNode,
  stripProps?: boolean,
): IASTNode | null {
  if (node.nodeId === targetNodeId) {
    return prunedTarget;
  }

  if (!node.children || node.children.length === 0) {
    return null;
  }

  let foundInChild = false;
  const newChildren: IASTNode[] = [];

  for (const child of node.children) {
    const ancestorBranch = pruneAncestorTree(child, targetNodeId, prunedTarget, stripProps);
    if (ancestorBranch) {
      foundInChild = true;
      newChildren.push(ancestorBranch);
    } else {
      // Sibling branch not containing targetNodeId — replace with ultra-light skeleton summary
      newChildren.push({
        nodeId: child.nodeId,
        type: child.type,
        props: {
          _isPrunedSibling: true,
          ...(child.props?.id ? { id: child.props.id } : {}),
        },
        styles: {},
      });
    }
  }

  if (!foundInChild) {
    return null;
  }

  return {
    nodeId: node.nodeId,
    type: node.type,
    props: stripProps ? filterEssentialProps(node.props) : { ...node.props },
    styles: { ...node.styles },
    children: newChildren,
  };
}

/** Filters out large data attributes or non-visual props for AI prompt token reduction */
function filterEssentialProps(props: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (key === 'id' || key === 'className' || key === 'href' || key === 'src' || key === 'content' || key === 'alt') {
      filtered[key] = val;
    }
  }
  return filtered;
}
