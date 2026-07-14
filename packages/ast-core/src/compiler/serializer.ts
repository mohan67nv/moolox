/**
 * @moolox/ast-core — AST to Next.js TSX Code Serializer (AST-002)
 *
 * Serializer converting canonical `IASTNode` trees back into clean, buildable,
 * human-readable Next.js 15 App Router React code (`exportAsComponent`, `includeNodeIds`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IASTNode, ASTNodeSchema } from '@moolox/types';

/**
 * Options controlling JSX/TSX code serialization formatting and wrappers.
 */
export interface SerializeOptions {
  /** Number of spaces per indentation level (`2` by default) */
  indentSize?: number;
  /** Whether to emit `data-node-id` attributes on DOM elements (`true` by default for canvas sync) */
  includeNodeIds?: boolean;
  /** Whether to wrap output inside a full React Functional Component (`export default function ...`) */
  exportAsComponent?: boolean;
  /** Component function name if `exportAsComponent` is true (`MooloxCanvasComponent` by default) */
  componentName?: string;
  /** Whether to enforce Zod schema validation before serializing (`true` by default) */
  validateSchema?: boolean;
}

/**
 * Serializes an `IASTNode` tree into a React TSX string (`<div className="...">...</div>`).
 */
export function serializeAST(node: IASTNode, options: SerializeOptions = {}): string {
  if (!node) {
    throw new Error('Cannot serialize null or undefined IASTNode.');
  }

  const validNode = options.validateSchema !== false ? ASTNodeSchema.parse(node) : node;
  const indentSize = options.indentSize ?? 2;
  const includeNodeIds = options.includeNodeIds ?? true;

  const serializedBody = serializeNode(validNode, 0, indentSize, includeNodeIds);

  if (options.exportAsComponent) {
    const compName = options.componentName || 'MooloxCanvasComponent';
    const lines = [
      'import React from \'react\';',
      '',
      `export default function ${compName}() {`,
      `${' '.repeat(indentSize)}return (`,
      indentLines(serializedBody, indentSize * 2),
      `${' '.repeat(indentSize)});`,
      '}',
      '',
    ];
    return lines.join('\n');
  }

  return serializedBody;
}

/**
 * Recursive visitor serializing an AST node and its children into JSX syntax.
 */
function serializeNode(node: IASTNode, depth: number, indentSize: number, includeNodeIds: boolean): string {
  const indent = ' '.repeat(depth * indentSize);

  // 1. Handle text nodes (`type: 'text'`)
  if (node.type === 'text') {
    const content = typeof node.props?.content === 'string' ? node.props.content : '';
    // If text has special characters or leading/trailing whitespace, wrap in JSX string or evaluation
    if (/[<>\{\}\n]/.test(content)) {
      return `${indent}{${JSON.stringify(content)}}`;
    }
    return `${indent}${content}`;
  }

  // 2. Handle Fragment nodes (`type: 'Fragment'`)
  if (node.type === 'Fragment') {
    if (!node.children || node.children.length === 0) {
      return `${indent}<></>`;
    }
    const childLines = node.children.map((c) => serializeNode(c, depth + 1, indentSize, includeNodeIds));
    return [`${indent}<>`, ...childLines, `${indent}</>`].join('\n');
  }

  // 3. Build opening element attributes (`data-node-id`, `id`, `className`, custom props, styles)
  const attributes: string[] = [];

  if (includeNodeIds) {
    attributes.push(`data-node-id="${node.nodeId}"`);
  }

  // Process standard props (`id`, `href`, `className`, `disabled`, etc.)
  if (node.props && typeof node.props === 'object') {
    for (const [key, val] of Object.entries(node.props)) {
      if (key === 'content' && node.type === 'text') continue; // Handled above
      if (val === undefined || val === null) continue;

      if (typeof val === 'boolean') {
        if (val) attributes.push(key); // Boolean prop (`<input disabled />`)
        else attributes.push(`${key}={false}`);
      } else if (typeof val === 'string') {
        attributes.push(`${key}="${escapeAttributeString(val)}"`);
      } else if (typeof val === 'number') {
        attributes.push(`${key}={${val}}`);
      } else if (typeof val === 'object') {
        attributes.push(`${key}={${JSON.stringify(val)}}`);
      }
    }
  }

  const attrString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';

  // 4. Handle self-closing elements when children are absent
  if (!node.children || node.children.length === 0) {
    return `${indent}<${node.type}${attrString} />`;
  }

  // 5. Handle element with children
  if (node.children.length === 1 && node.children[0]!.type === 'text') {
    const textChild = node.children[0]!;
    const content = typeof textChild.props?.content === 'string' ? textChild.props.content : '';
    // If short single-line text without JSX reserved characters, format inline on a single line (`<h1 className="...">Title</h1>`)
    if (!/[<>\{\}\n]/.test(content) && content.length < 50) {
      return `${indent}<${node.type}${attrString}>${content}</${node.type}>`;
    }
  }

  const childLines = node.children.map((c) => serializeNode(c, depth + 1, indentSize, includeNodeIds));
  return [`${indent}<${node.type}${attrString}>`, ...childLines, `${indent}</${node.type}>`].join('\n');
}

/** Escapes double quotes inside JSX attribute strings */
function escapeAttributeString(str: string): string {
  return str.replace(/"/g, '&quot;');
}

/** Indents a multi-line string block */
function indentLines(str: string, spaces: number): string {
  const prefix = ' '.repeat(spaces);
  return str
    .split('\n')
    .map((l) => (l ? `${prefix}${l}` : l))
    .join('\n');
}
