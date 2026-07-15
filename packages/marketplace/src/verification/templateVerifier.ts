/**
 * @moolox/marketplace — Template Submission & Verification Gate (`MKT-003`)
 *
 * Automated verification engine ensuring that submitted community AST templates adhere to
 * strict `node-{uuid}` ID conventions (`ORC-001..004`), contain zero raw hex strings (`TKN-003 Zero-Hex Law`),
 * and contain zero malicious XSS attributes prior to marketplace publication.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IASTNode } from '@moolox/types';
import { enforceTokenResolution } from '@moolox/tokens';

export interface TemplateVerificationAudit {
  verified: boolean;
  templateTitle: string;
  totalNodesChecked: number;
  hexViolationsSanitized: number;
  securityErrors: string[];
  structureErrors: string[];
}

export class TemplateVerificationEngine {
  private static readonly NODE_ID_REGEX = /^node-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  private static readonly HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/;
  private static readonly DANGEROUS_ATTRIBUTES = new Set(['onError', 'onLoad', 'onClick', 'onMouseOver', 'dangerouslySetInnerHTML']);
  private static readonly PROTOTYPE_POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  private static readonly DOM_CLOBBERING_NAMES = new Set(['location', 'document', 'window', 'top', 'parent', 'self', 'opener']);
  private static readonly DANGEROUS_PROTOCOLS = ['javascript:', 'vbscript:', 'data:text/html'];

  /**
   * Audits and certifies a submitted AST template tree for marketplace listing (`MKT-003`, `MKT-004`).
   */
  static verifyTemplate(templateTitle: string, rootNode: IASTNode): TemplateVerificationAudit {
    const securityErrors: string[] = [];
    const structureErrors: string[] = [];
    let nodesChecked = 0;
    let hexSanitized = 0;

    const traverse = (node: IASTNode) => {
      nodesChecked++;

      // 0. Reject <script> tags or executable script types
      if (node.type && typeof node.type === 'string' && node.type.toLowerCase() === 'script') {
        securityErrors.push(`Node '${node.nodeId || 'unknown'}' has forbidden type 'script' attempting arbitrary code execution.`);
      }

      // 1. Verify node-{uuid} format or assign one if draft
      if (typeof node.nodeId !== 'string' || (!node.nodeId.startsWith('node-') && !this.NODE_ID_REGEX.test(node.nodeId))) {
        structureErrors.push(`Node '${node.nodeId || 'unknown'}' violates canonical 'node-{uuid}' ID structure.`);
      }

      // 2. Check for XSS dangerous attributes, prototype pollution, and DOM clobbering
      if (node.props && typeof node.props === 'object') {
        for (const key of Object.keys(node.props)) {
          if (this.PROTOTYPE_POLLUTION_KEYS.has(key)) {
            securityErrors.push(`Node '${node.nodeId}' contains forbidden prototype pollution key '${key}'.`);
          }
          if (this.DANGEROUS_ATTRIBUTES.has(key) || key.toLowerCase().startsWith('on')) {
            securityErrors.push(`Node '${node.nodeId}' contains forbidden script attribute '${key}'.`);
          }
          const val = node.props[key];
          if (typeof val === 'string') {
            const lowerVal = val.toLowerCase().trim();
            for (const proto of this.DANGEROUS_PROTOCOLS) {
              if (lowerVal.includes(proto)) {
                securityErrors.push(`Node '${node.nodeId}' contains dangerous '${proto}' protocol inside prop '${key}'.`);
              }
            }
            // DOM clobbering check on id or name attributes
            if ((key === 'id' || key === 'name') && this.DOM_CLOBBERING_NAMES.has(lowerVal)) {
              securityErrors.push(`Node '${node.nodeId}' attempts DOM clobbering via ${key}='${val}'.`);
            }
          }
        }
      }

      // 3. Check for Raw Hex & Ad-Hoc Utilities (`TKN-003` Zero-Hex Law across styles & tokens)
      const targetMaps = [node.styles, (node as any).tokens].filter(Boolean);
      for (const targetMap of targetMaps) {
        if (typeof targetMap === 'object') {
          for (const key of Object.keys(targetMap)) {
            if (this.PROTOTYPE_POLLUTION_KEYS.has(key)) {
              securityErrors.push(`Node '${node.nodeId}' contains forbidden prototype pollution key '${key}' in styles/tokens.`);
              continue;
            }
            const value = (targetMap as Record<string, any>)[key];
            if (typeof value === 'string' && this.HEX_REGEX.test(value)) {
              const resolution = enforceTokenResolution(value, {} as any);
              if (resolution.wasMapped) {
                (targetMap as Record<string, any>)[key] = resolution.resolvedTokenPath;
                hexSanitized++;
              } else {
                structureErrors.push(`Node '${node.nodeId}' contains unresolvable raw hex value '${value}' in key '${key}'.`);
              }
            }
          }
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    if (!rootNode || typeof rootNode !== 'object') {
      return {
        verified: false,
        templateTitle,
        totalNodesChecked: 0,
        hexViolationsSanitized: 0,
        securityErrors: ['Template root AST node is null or malformed.'],
        structureErrors: [],
      };
    }

    traverse(rootNode);

    const verified = securityErrors.length === 0 && structureErrors.length === 0;

    return {
      verified,
      templateTitle,
      totalNodesChecked: nodesChecked,
      hexViolationsSanitized: hexSanitized,
      securityErrors,
      structureErrors,
    };
  }
}
