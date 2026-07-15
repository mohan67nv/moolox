/**
 * @moolox/project — 1-Click Template Duplication Bridge (PRJ-005)
 *
 * Duplicates complete project templates into target multi-tenant workspaces,
 * cloning AST node hierarchies with canonical `node-{uuid}` compliance and
 * applying any of the 50 Obsidian Brand Presets (`CMP-002`) in `< 50ms`.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import crypto from 'node:crypto';
import { type IASTNode, type TokenDocument } from '@moolox/types';
import { getBrandPresetById, compileTokenMapToCSS, type TokenCompilationResult } from '@moolox/tokens';

export interface ProjectTemplateSnapshot {
  templateId: string;
  name: string;
  description?: string;
  astTree: IASTNode;
  tokenDocument: TokenDocument;
}

export interface DuplicateOptions {
  /** Optional brand preset ID (`cyberpunk-dark`, `fintech-clean`, etc.) to apply upon duplication */
  presetId?: string;
  /** New project name override */
  newProjectName?: string;
  /** Whether to regenerate UUIDs for every node (`node-{uuid}`) to prevent collisions */
  regenerateNodeIds?: boolean;
}

export interface DuplicationResult {
  /** New generated project ID (`prj_${uuid}`) */
  projectId: string;
  /** New root version ID (`ver_${uuid}`) */
  versionId: string;
  /** Target workspace ID */
  workspaceId: string;
  /** New project name */
  name: string;
  /** Cloned and re-IDed AST tree */
  astTree: IASTNode;
  /** Active token document (either cloned or swapped from brand preset) */
  tokenDocument: TokenDocument;
  /** Compiled CSS custom properties for the new project */
  compilation: TokenCompilationResult;
  /** Execution time in milliseconds (`target < 50ms`) */
  durationMs: number;
}

/**
 * Deep clones an `IASTNode` hierarchy while ensuring every node adheres strictly to
 * the canonical `node-{uuid}` format (`ASTMutationPatchSchema` mandate).
 */
export function cloneAndReIdASTNode(node: IASTNode, regenerateNodeIds = true): IASTNode {
  if (!node) return node;

  const newId = regenerateNodeIds ? `node-${crypto.randomUUID().slice(0, 8)}` : node.nodeId;
  const newProps = { ...node.props };
  const newStyles: Record<string, string> = {};
  if (node.styles) {
    for (const [k, v] of Object.entries(node.styles)) {
      if (typeof v === 'string') {
        newStyles[k] = v;
      }
    }
  }

  const newChildren = node.children
    ? node.children.map((child) => cloneAndReIdASTNode(child, regenerateNodeIds))
    : undefined;

  return {
    nodeId: newId,
    type: node.type,
    props: newProps,
    styles: newStyles,
    children: newChildren,
  };
}

/**
 * Duplicates a project template into a target workspace in `< 50ms` (`PRJ-005`).
 */
export function duplicateProjectTemplate(
  source: ProjectTemplateSnapshot,
  targetWorkspaceId: string,
  options: DuplicateOptions = {},
): DuplicationResult {
  const start = performance.now();

  const projectId = `prj_${crypto.randomUUID().slice(0, 8)}`;
  const versionId = `ver_${crypto.randomUUID().slice(0, 8)}`;
  const projectName = options.newProjectName || `${source.name} (Copy)`;

  const regenerateNodeIds = options.regenerateNodeIds ?? true;
  const clonedTree = cloneAndReIdASTNode(source.astTree, regenerateNodeIds);

  let targetTokenDoc: TokenDocument;

  if (options.presetId) {
    const preset = getBrandPresetById(options.presetId);
    targetTokenDoc = {
      metadata: {
        version: '1.0.0',
        name: preset.name,
        colorMode: preset.category === 'light' ? 'light' : 'dark',
        updatedAt: Date.now(),
      },
      tokens: JSON.parse(JSON.stringify(preset.tokens)),
    };
  } else {
    targetTokenDoc = JSON.parse(JSON.stringify(source.tokenDocument));
    targetTokenDoc.metadata.updatedAt = Date.now();
  }

  const compilation = compileTokenMapToCSS(targetTokenDoc.tokens, { prefix: 'dios' });
  const durationMs = performance.now() - start;

  return {
    projectId,
    versionId,
    workspaceId: targetWorkspaceId,
    name: projectName,
    astTree: clonedTree,
    tokenDocument: targetTokenDoc,
    compilation,
    durationMs,
  };
}
