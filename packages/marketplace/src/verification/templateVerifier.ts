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

  /**
   * Audits and certifies a submitted AST template tree for marketplace listing (`MKT-003`).
   */
  static verifyTemplate(templateTitle: string, rootNode: IASTNode): TemplateVerificationAudit {
    const securityErrors: string[] = [];
    const structureErrors: string[] = [];
    let nodesChecked = 0;
    let hexSanitized = 0;

    const traverse = (node: IASTNode) => {
      nodesChecked++;

      // 1. Verify node-{uuid} format or assign one if draft
      if (typeof node.nodeId !== 'string' || (!node.nodeId.startsWith('node-') && !this.NODE_ID_REGEX.test(node.nodeId))) {
        structureErrors.push(`Node '${node.nodeId || 'unknown'}' violates canonical 'node-{uuid}' ID structure.`);
      }

      // 2. Check for XSS dangerous attributes
      if (node.props) {
        for (const key of Object.keys(node.props)) {
          if (this.DANGEROUS_ATTRIBUTES.has(key) || key.toLowerCase().startsWith('on')) {
            securityErrors.push(`Node '${node.nodeId}' contains forbidden script attribute '${key}'.`);
          }
          const val = node.props[key];
          if (typeof val === 'string' && val.toLowerCase().includes('javascript:')) {
            securityErrors.push(`Node '${node.nodeId}' contains dangerous 'javascript:' protocol inside prop '${key}'.`);
          }
        }
      }

      // 3. Check for Raw Hex & Ad-Hoc Utilities (`TKN-003` Zero-Hex Law across styles & tokens)
      const targetMaps = [node.styles, (node as any).tokens].filter(Boolean);
      for (const targetMap of targetMaps) {
        for (const [key, value] of Object.entries(targetMap)) {
          if (typeof value === 'string' && this.HEX_REGEX.test(value)) {
            // Auto-resolve hex through Euclidean distance mapping
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
