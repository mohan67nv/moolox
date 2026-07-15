/**
 * @moolox/components — 1-Click Component Packaging & AST Insertion Engine (`CMP-006`, `PRJ-006`)
 *
 * Packages arbitrary canvas AST sub-trees along with their referenced design token requirements (`tokens.json`)
 * into standalone marketplace-ready bundles (`ComponentPackageManifest`). When inserted into a destination
 * workspace project, it performs N-1 ID remapping (`node-{uuid}`) and merges design tokens cleanly (`TKN-003`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IASTNode } from '@moolox/types';

export interface ComponentPackageManifest {
  packageId: string;
  title: string;
  creatorId: string;
  version: string;
  astTree: IASTNode;
  bundledTokens: Record<string, any>;
  createdAt: number;
}

export interface ComponentInsertionResult {
  success: boolean;
  insertedRootNode?: IASTNode;
  totalNodesInserted: number;
  tokensMergedCount: number;
  error?: string;
}

export class ComponentPackagingEngine {
  private static readonly NODE_ID_REGEX = /^node-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  /**
   * Bundles an AST sub-tree and extracts all referenced design token definitions (`CMP-006`).
   */
  static packageComponent(
    packageId: string,
    title: string,
    rootNode: IASTNode,
    fullTokenCatalog: Record<string, any> = {},
    creatorId: string = 'creator-default',
    version: string = '1.0.0'
  ): ComponentPackageManifest {
    const clonedTree: IASTNode = JSON.parse(JSON.stringify(rootNode));
    const bundledTokens: Record<string, any> = {};

    // Helper to resolve nested path in fullTokenCatalog (e.g. 'colors.brand.primary')
    const lookupToken = (path: string, obj: any): any => {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[part];
      }
      return current;
    };

    const traverseAndCollect = (node: IASTNode) => {
      const targetMaps = [node.styles, (node as any).tokens].filter(Boolean);
      for (const targetMap of targetMaps) {
        if (typeof targetMap === 'object') {
          for (const [key, value] of Object.entries(targetMap)) {
            if (typeof value === 'string' && value.includes('.')) {
              const foundVal = lookupToken(value, fullTokenCatalog);
              if (foundVal !== undefined) {
                bundledTokens[value] = foundVal;
              }
            }
          }
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          traverseAndCollect(child);
        }
      }
    };

    traverseAndCollect(clonedTree);

    return {
      packageId,
      title,
      creatorId,
      version,
      astTree: clonedTree,
      bundledTokens,
      createdAt: Date.now(),
    };
  }

  /**
   * Generates a canonical `node-{uuid}` ID compatible with `ORC-001..004`.
   */
  private static generateCanonicalUUID(): string {
    const hex = (len: number) =>
      Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return `node-${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
  }

  /**
   * Unpacks a component manifest, performs N-1 ID remapping (`node-{uuid}`), merges token dependencies,
   * and inserts the root node into the target parent of a destination AST project tree (`CMP-006`, `PRJ-006`).
   */
  static unpackAndInsert(
    manifest: ComponentPackageManifest,
    targetProjectTree: IASTNode,
    targetParentNodeId: string,
    tokenCallback?: (tokenPath: string, tokenValue: any) => void
  ): ComponentInsertionResult {
    if (!manifest || !manifest.astTree) {
      return { success: false, totalNodesInserted: 0, tokensMergedCount: 0, error: 'Malformed ComponentPackageManifest provided.' };
    }

    // 1. Remap all node IDs cleanly (`N-1 ID remapping`)
    const clonedSubtree: IASTNode = JSON.parse(JSON.stringify(manifest.astTree));
    let totalNodes = 0;

    const remapIDs = (node: IASTNode) => {
      totalNodes++;
      node.nodeId = this.generateCanonicalUUID();
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          remapIDs(child);
        }
      }
    };

    remapIDs(clonedSubtree);

    // 2. Merge bundled tokens via callback
    let tokensMerged = 0;
    if (manifest.bundledTokens && typeof manifest.bundledTokens === 'object') {
      for (const [path, val] of Object.entries(manifest.bundledTokens)) {
        tokensMerged++;
        if (tokenCallback) {
          tokenCallback(path, val);
        }
      }
    }

    // 3. Find targetParentNodeId in targetProjectTree and append child
    let parentFound = false;
    const findAndAppend = (node: IASTNode): boolean => {
      if (node.nodeId === targetParentNodeId) {
        if (!Array.isArray(node.children)) {
          node.children = [];
        }
        node.children.push(clonedSubtree);
        parentFound = true;
        return true;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          if (findAndAppend(child)) return true;
        }
      }
      return false;
    };

    if (targetParentNodeId === 'root' || targetParentNodeId === targetProjectTree.nodeId) {
      if (!Array.isArray(targetProjectTree.children)) {
        targetProjectTree.children = [];
      }
      targetProjectTree.children.push(clonedSubtree);
      parentFound = true;
    } else {
      findAndAppend(targetProjectTree);
    }

    if (!parentFound) {
      return {
        success: false,
        totalNodesInserted: 0,
        tokensMergedCount: 0,
        error: `Target parent node '${targetParentNodeId}' not found in destination project tree.`,
      };
    }

    return {
      success: true,
      insertedRootNode: clonedSubtree,
      totalNodesInserted: totalNodes,
      tokensMergedCount: tokensMerged,
    };
  }
}
