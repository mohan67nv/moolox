/**
 * @moolox/tokens — Real-Time Token Compiler & Zero-Hex Enforcement Unit Tests
 *
 * Validates sub-5ms compilation (`TKN-002`) and ad-hoc hex detection/auto-mapping (`TKN-003`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { compileTokenMapToCSS } from '../src/compiler/tailwind';
import { validateNoRawHexOrAdhocValues, enforceTokenResolution, sanitizeNodeTokens } from '../src/compiler/enforce';
import { type IW3CTokenMap, type IASTNode } from '@moolox/types';

describe('Real-Time Token-to-Tailwind Compiler (TKN-002)', () => {
  const sampleTokens: IW3CTokenMap = {
    color: {
      bg: {
        primary: { value: '#1a1a2e', type: 'color' },
        secondary: { value: '#16213e', type: 'color' },
      },
      accent: {
        error: { value: '#e63946', type: 'color' },
        success: { value: '#2a9d8f', type: 'color' },
      },
    },
    space: {
      '4': { value: '4px', type: 'dimension' },
      '8': { value: '8px', type: 'dimension' },
    },
    font: {
      family: {
        sans: { value: 'Inter, sans-serif', type: 'fontFamily' },
      },
    },
  };

  it('compileTokenMapToCSS transforms tokens into CSS variables and Tailwind v4 theme blocks in < 5ms', () => {
    const result = compileTokenMapToCSS(sampleTokens, { prefix: 'dios', includeTailwindTheme: true });

    expect(result.durationMs).toBeLessThan(5);
    expect(result.cssText).toContain('--dios-color-bg-primary: #1a1a2e;');
    expect(result.cssText).toContain('--dios-space-8: 8px;');
    expect(result.cssText).toContain('--color-bg-primary: var(--dios-color-bg-primary);');
    expect(result.variables['--dios-color-accent-error']).toBe('#e63946');
  });
});

describe('Hardcoded Token Enforcement Rule Engine & Zero-Hex Law (TKN-003)', () => {
  const sampleTokens: IW3CTokenMap = {
    color: {
      bg: {
        primary: { value: '#101010', type: 'color' },
      },
      accent: {
        error: { value: '#ff3333', type: 'color' },
        blue: { value: '#0066ff', type: 'color' },
      },
    },
    space: {},
    font: {},
  };

  it('enforceTokenResolution detects hex strings and finds exact or Euclidean nearest color token', () => {
    // Exact match test
    const exact = enforceTokenResolution('#ff3333', sampleTokens);
    expect(exact.resolvedTokenPath).toBe('color.accent.error');
    expect(exact.wasMapped).toBe(true);

    // Nearest distance test (#0060f0 is very close to #0066ff blue)
    const nearest = enforceTokenResolution('#0060f0', sampleTokens);
    expect(nearest.resolvedTokenPath).toBe('color.accent.blue');
    expect(nearest.resolvedCssVar).toBe('--dios-color-accent-blue');
    expect(nearest.wasMapped).toBe(true);
  });

  it('validateNoRawHexOrAdhocValues detects violations inside AST node props or inline styles', () => {
    const dirtyNode: IASTNode = {
      nodeId: 'node-btn',
      type: 'button',
      props: {
        className: 'px-4 py-2 bg-[#ff3333] text-white',
      },
      styles: {
        borderColor: '#0066ff',
      },
    };

    const { valid, violations } = validateNoRawHexOrAdhocValues(dirtyNode, sampleTokens);
    expect(valid).toBe(false);
    expect(violations).toHaveLength(2);
    expect(violations[0]?.propertyKey).toBe('className');
    expect(violations[0]?.suggestedTokenPath).toBe('color.accent.error');
    expect(violations[1]?.propertyKey).toBe('style.borderColor');
    expect(violations[1]?.suggestedTokenPath).toBe('color.accent.blue');
  });

  it('sanitizeNodeTokens automatically replaces raw hex values with CSS token variables', () => {
    const dirtyNode: IASTNode = {
      nodeId: 'node-card',
      type: 'div',
      props: { className: 'bg-[#ff3333]' },
      styles: { color: '#0060f0' },
    };

    const cleanNode = sanitizeNodeTokens(dirtyNode, sampleTokens);
    expect(cleanNode.props.className).toBe('bg-[var(--dios-color-accent-error)]');
    expect(cleanNode.styles.color).toBe('var(--dios-color-accent-blue)');
  });
});
