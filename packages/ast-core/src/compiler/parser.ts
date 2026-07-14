/**
 * @moolox/ast-core — SWC AST Parser & Tree Visitor (AST-002)
 *
 * Fast TypeScript visitor engine parsing raw JSX/TSX files into `IASTNode` trees.
 * Converts React components, attributes, inline styles, and text into our canonical
 * JSONB AST node format (`nodeId`, `type`, `props`, `styles`, `children`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import * as swc from '@swc/core';
import {
  type IASTNode,
  type ASTNodeId,
  ASTNodeSchema,
  ASTNodeIdSchema,
} from '@moolox/types';

/**
 * Options for parsing raw JSX/TSX into `IASTNode` trees.
 */
export interface ParseOptions {
  /** Prefix for stable node ID generation if `data-node-id` is absent */
  nodeIdPrefix?: string;
  /** Whether to strip comments during parsing */
  stripComments?: boolean;
  /** Whether to validate generated nodes against Zod schema */
  validateSchema?: boolean;
}

/**
 * Parses raw React JSX/TSX source code into an `IASTNode` hierarchical tree.
 * Uses `@swc/core` fast rust parser (`< 30ms`).
 */
export function parseJSX(rawCode: string, options: ParseOptions = {}): IASTNode {
  if (!rawCode || !rawCode.trim()) {
    throw new Error('Cannot parse empty or whitespace-only JSX source code.');
  }

  // Use SWC parseSync with TypeScript & JSX enabled
  let swcModule: swc.Module;
  try {
    swcModule = swc.parseSync(rawCode, {
      syntax: 'typescript',
      tsx: true,
      comments: !options.stripComments,
    });
  } catch (error) {
    throw new Error(`SWC JSX syntax parse error: ${error instanceof Error ? error.message : String(error)}`);
  }

  const visitor = new JSXASTVisitor(options.nodeIdPrefix || 'node');
  const rootNodes = visitor.visitModule(swcModule);

  if (rootNodes.length === 0) {
    // Return an empty fragment node if no JSX element found
    const fallbackNode: IASTNode = {
      nodeId: visitor.getNextNodeId(),
      type: 'Fragment',
      props: {},
      styles: {},
      children: [],
    };
    return options.validateSchema ? ASTNodeSchema.parse(fallbackNode) : fallbackNode;
  }

  // If there's a single root element (common for React components), return it directly.
  // Otherwise wrap in a Fragment root node.
  const rootNode =
    rootNodes.length === 1
      ? rootNodes[0]!
      : {
          nodeId: visitor.getNextNodeId(),
          type: 'Fragment',
          props: {},
          styles: {},
          children: rootNodes,
        };

  return options.validateSchema ? ASTNodeSchema.parse(rootNode) : rootNode;
}

/**
 * Internal SWC AST Visitor converting SWC JSX nodes into Moolox `IASTNode`s.
 */
class JSXASTVisitor {
  private nodeCounter = 1;
  private readonly idPrefix: string;

  constructor(idPrefix: string) {
    this.idPrefix = idPrefix;
  }

  public getNextNodeId(): ASTNodeId {
    const id = `${this.idPrefix}-${this.nodeCounter++}`;
    return ASTNodeIdSchema.parse(id);
  }

  public visitModule(swcModule: swc.Module): IASTNode[] {
    const results: IASTNode[] = [];

    for (const item of swcModule.body) {
      if (item.type === 'ExpressionStatement' && isJSXExpression(item.expression)) {
        const node = this.visitJSXExpression(item.expression);
        if (node) results.push(node);
      } else if (item.type === 'ReturnStatement' && item.argument && isJSXExpression(item.argument)) {
        const node = this.visitJSXExpression(item.argument);
        if (node) results.push(node);
      } else if (
        item.type === 'ExportDefaultDeclaration' &&
        item.decl &&
        item.decl.type === 'FunctionExpression' &&
        item.decl.body
      ) {
        // Traverse default exported functional component body for return statement
        for (const stmt of item.decl.body.stmts) {
          if (stmt.type === 'ReturnStatement' && stmt.argument && isJSXExpression(stmt.argument)) {
            const node = this.visitJSXExpression(stmt.argument);
            if (node) results.push(node);
          }
        }
      } else if (
        item.type === 'VariableDeclaration'
      ) {
        // Traverse const App = () => <div /> or const App = function() { return <div />; }
        for (const decl of item.declarations) {
          if (decl.init && isJSXExpression(decl.init)) {
            const node = this.visitJSXExpression(decl.init);
            if (node) results.push(node);
          } else if (decl.init && (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression')) {
            const body = decl.init.body;
            if (isJSXExpression(body)) {
              const node = this.visitJSXExpression(body);
              if (node) results.push(node);
            } else if (body && body.type === 'BlockStatement' && 'stmts' in body) {
              for (const stmt of (body as swc.BlockStatement).stmts) {
                if (stmt.type === 'ReturnStatement' && stmt.argument && isJSXExpression(stmt.argument)) {
                  const node = this.visitJSXExpression(stmt.argument);
                  if (node) results.push(node);
                }
              }
            }
          }
        }
      }
    }

    return results;
  }

  public visitJSXExpression(expr: swc.Expression | swc.JSXElement | swc.JSXFragment): IASTNode | null {
    if (expr.type === 'JSXElement') {
      return this.visitJSXElement(expr);
    } else if (expr.type === 'JSXFragment') {
      return this.visitJSXFragment(expr);
    } else if (expr.type === 'ParenthesisExpression') {
      return this.visitJSXExpression(expr.expression);
    }
    return null;
  }

  private visitJSXElement(element: swc.JSXElement): IASTNode {
    const tagName = getJSXTagName(element.opening.name);
    const props: Record<string, unknown> = {};
    const styles: Record<string, string> = {};
    let customNodeId: ASTNodeId | null = null;

    for (const attr of (element.opening.attributes || [])) {
      if (attr.type === 'JSXAttribute' && attr.name.type === 'Identifier') {
        const attrName = attr.name.value;
        const attrValue = extractJSXAttributeValue(attr.value);

        if (attrName === 'data-node-id' && typeof attrValue === 'string') {
          try {
            customNodeId = ASTNodeIdSchema.parse(attrValue);
          } catch {
            customNodeId = null;
          }
        } else if (attrName === 'className' && typeof attrValue === 'string') {
          props.className = attrValue;
          // Map Tailwind utility classes into styles token dictionary for inspector access
          styles.className = attrValue;
        } else if (attrName === 'style' && typeof attrValue === 'object' && attrValue !== null) {
          // Inline style object (`style={{ color: 'red' }}`)
          for (const [k, v] of Object.entries(attrValue as Record<string, unknown>)) {
            if (typeof v === 'string' || typeof v === 'number') {
              styles[k] = String(v);
            }
          }
          props.style = attrValue;
        } else {
          props[attrName] = attrValue;
        }
      }
    }

    const nodeId = customNodeId || this.getNextNodeId();
    const children: IASTNode[] = [];

    for (const child of element.children) {
      const childNode = this.visitJSXChild(child);
      if (childNode) {
        children.push(childNode);
      }
    }

    return {
      nodeId,
      type: tagName,
      props,
      styles,
      children,
    };
  }

  private visitJSXFragment(fragment: swc.JSXFragment): IASTNode {
    const nodeId = this.getNextNodeId();
    const children: IASTNode[] = [];

    for (const child of fragment.children) {
      const childNode = this.visitJSXChild(child);
      if (childNode) {
        children.push(childNode);
      }
    }

    return {
      nodeId,
      type: 'Fragment',
      props: {},
      styles: {},
      children,
    };
  }

  private visitJSXChild(child: swc.JSXElementChild): IASTNode | null {
    if (child.type === 'JSXElement') {
      return this.visitJSXElement(child);
    } else if (child.type === 'JSXFragment') {
      return this.visitJSXFragment(child);
    } else if (child.type === 'JSXText') {
      const textContent = child.value.replace(/\s+/g, ' ').trim();
      if (!textContent) {
        return null; // Ignore whitespace-only JSXText
      }
      return {
        nodeId: this.getNextNodeId(),
        type: 'text',
        props: { content: textContent },
        styles: {},
      };
    } else if (child.type === 'JSXExpressionContainer') {
      if (child.expression.type === 'StringLiteral') {
        return {
          nodeId: this.getNextNodeId(),
          type: 'text',
          props: { content: child.expression.value },
          styles: {},
        };
      } else if (isJSXExpression(child.expression)) {
        return this.visitJSXExpression(child.expression);
      }
    }
    return null;
  }
}

/** Helper to check if SWC expression is JSX */
function isJSXExpression(expr: unknown): expr is swc.JSXElement | swc.JSXFragment | swc.ParenthesisExpression {
  if (!expr || typeof expr !== 'object') return false;
  const t = (expr as { type?: string }).type;
  return t === 'JSXElement' || t === 'JSXFragment' || t === 'ParenthesisExpression';
}

/** Resolves opening JSXElementName (`div`, `Hero.Title`, etc.) */
function getJSXTagName(name: swc.JSXElementName): string {
  if (name.type === 'Identifier') {
    return name.value;
  } else if (name.type === 'JSXMemberExpression') {
    const obj = getJSXTagName(name.object);
    return `${obj}.${name.property.value}`;
  } else if (name.type === 'JSXNamespacedName') {
    return `${name.namespace.value}:${name.name.value}`;
  }
  return 'div';
}

/** Extracts JavaScript value from JSXAttrValue */
function extractJSXAttributeValue(value?: swc.JSXAttrValue): unknown {
  if (!value) return true; // Boolean attribute (`<button disabled />`)
  if (value.type === 'StringLiteral') {
    return value.value;
  } else if (value.type === 'JSXExpressionContainer') {
    const expr = value.expression;
    if (expr.type === 'StringLiteral') return expr.value;
    if (expr.type === 'NumericLiteral') return expr.value;
    if (expr.type === 'BooleanLiteral') return expr.value;
    if (expr.type === 'NullLiteral') return null;
    if (expr.type === 'ObjectExpression') {
      const obj: Record<string, unknown> = {};
      for (const prop of expr.properties) {
        if (prop.type === 'KeyValueProperty' && prop.key.type === 'Identifier') {
          const key = prop.key.value;
          if (prop.value.type === 'StringLiteral') obj[key] = prop.value.value;
          else if (prop.value.type === 'NumericLiteral') obj[key] = prop.value.value;
        }
      }
      return obj;
    }
  }
  return undefined;
}
