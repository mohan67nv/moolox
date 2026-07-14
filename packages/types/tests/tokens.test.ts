/**
 * @moolox/types — W3C Design Token Schema Tests (Feature: TKN-001)
 *
 * Validates W3CTokenMap and TokenDocument Zod schemas against
 * valid and invalid payloads, ensuring design token contract enforcement.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import {
  TokenValueSchema,
  W3CTokenMapSchema,
  TokenDocumentSchema,
  TokenMetadataSchema,
  type IW3CTokenMap,
  type TokenDocument,
} from '../src/index';

// ---------------------------------------------------------------------------
// TokenValue Validation
// ---------------------------------------------------------------------------

describe('TokenValueSchema', () => {
  it('accepts valid color tokens', () => {
    const token = { value: '#1a1a2e', type: 'color' as const };
    expect(TokenValueSchema.parse(token)).toBeTruthy();
  });

  it('accepts valid dimension tokens', () => {
    const token = { value: '16px', type: 'dimension' as const };
    expect(TokenValueSchema.parse(token)).toBeTruthy();
  });

  it('accepts valid font family tokens', () => {
    const token = { value: 'Inter, sans-serif', type: 'fontFamily' as const };
    expect(TokenValueSchema.parse(token)).toBeTruthy();
  });

  it('accepts tokens with descriptions', () => {
    const token = {
      value: '#e94560',
      type: 'color' as const,
      description: 'Primary accent color used for CTAs and interactive elements',
    };
    const result = TokenValueSchema.parse(token);
    expect(result.description).toBe('Primary accent color used for CTAs and interactive elements');
  });

  it('rejects empty token values', () => {
    expect(() => TokenValueSchema.parse({ value: '', type: 'color' })).toThrow();
  });

  it('rejects invalid token types', () => {
    expect(() => TokenValueSchema.parse({ value: '#fff', type: 'invalid' })).toThrow();
  });

  it('accepts all valid W3C token types', () => {
    const types = [
      'color', 'dimension', 'fontFamily', 'fontWeight', 'fontStyle',
      'duration', 'cubicBezier', 'number', 'strokeStyle', 'border',
      'transition', 'shadow', 'gradient', 'typography', 'letterSpacing', 'lineHeight',
    ];
    for (const type of types) {
      expect(TokenValueSchema.parse({ value: 'test-value', type })).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// W3CTokenMap Validation
// ---------------------------------------------------------------------------

describe('W3CTokenMapSchema', () => {
  const validTokenMap: IW3CTokenMap = {
    color: {
      bg: {
        primary: { value: '#0f0f23', type: 'color' },
        secondary: { value: '#1a1a2e', type: 'color' },
      },
      text: {
        primary: { value: '#e6e6e6', type: 'color' },
        muted: { value: '#999999', type: 'color' },
      },
      accent: {
        primary: { value: '#e94560', type: 'color' },
      },
    },
    space: {
      '1': { value: '4px', type: 'dimension' },
      '2': { value: '8px', type: 'dimension' },
      '4': { value: '16px', type: 'dimension' },
      '8': { value: '32px', type: 'dimension' },
      '16': { value: '64px', type: 'dimension' },
    },
    font: {
      heading: {
        family: { value: 'Inter, sans-serif', type: 'fontFamily' },
        xl: { value: '48px', type: 'dimension' },
        lg: { value: '36px', type: 'dimension' },
      },
      body: {
        family: { value: 'Inter, sans-serif', type: 'fontFamily' },
        base: { value: '16px', type: 'dimension' },
        sm: { value: '14px', type: 'dimension' },
      },
    },
  };

  it('parses a complete valid token map', () => {
    const result = W3CTokenMapSchema.parse(validTokenMap);
    expect(result.color).toBeDefined();
    expect(result.space).toBeDefined();
    expect(result.font).toBeDefined();
  });

  it('accesses nested token values correctly', () => {
    const result = W3CTokenMapSchema.parse(validTokenMap);
    const bgPrimary = result.color.bg as Record<string, { value: string }>;
    expect(bgPrimary.primary.value).toBe('#0f0f23');
  });

  it('accepts token maps with optional extension groups', () => {
    const extended = {
      ...validTokenMap,
      radius: {
        sm: { value: '4px', type: 'dimension' as const },
        md: { value: '8px', type: 'dimension' as const },
        lg: { value: '16px', type: 'dimension' as const },
        full: { value: '9999px', type: 'dimension' as const },
      },
      shadow: {
        sm: { value: '0 1px 2px rgba(0,0,0,0.1)', type: 'shadow' as const },
        lg: { value: '0 8px 24px rgba(0,0,0,0.3)', type: 'shadow' as const },
      },
    };
    const result = W3CTokenMapSchema.parse(extended);
    expect(result.radius).toBeDefined();
    expect(result.shadow).toBeDefined();
  });

  it('rejects token maps missing required "color" group', () => {
    const { color: _, ...noColor } = validTokenMap;
    expect(() => W3CTokenMapSchema.parse(noColor)).toThrow();
  });

  it('rejects token maps missing required "space" group', () => {
    const { space: _, ...noSpace } = validTokenMap;
    expect(() => W3CTokenMapSchema.parse(noSpace)).toThrow();
  });

  it('rejects token maps missing required "font" group', () => {
    const { font: _, ...noFont } = validTokenMap;
    expect(() => W3CTokenMapSchema.parse(noFont)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// TokenMetadata Validation
// ---------------------------------------------------------------------------

describe('TokenMetadataSchema', () => {
  it('accepts valid metadata', () => {
    const metadata = {
      version: '1.0.0',
      name: 'Cyberpunk Dark',
      colorMode: 'dark' as const,
      updatedAt: Date.now(),
    };
    expect(TokenMetadataSchema.parse(metadata)).toBeTruthy();
  });

  it('defaults colorMode to dark', () => {
    const metadata = {
      version: '1.0.0',
      name: 'Test Theme',
      updatedAt: Date.now(),
    };
    const result = TokenMetadataSchema.parse(metadata);
    expect(result.colorMode).toBe('dark');
  });

  it('rejects invalid semver versions', () => {
    expect(() =>
      TokenMetadataSchema.parse({
        version: 'v1',
        name: 'Test',
        updatedAt: Date.now(),
      }),
    ).toThrow();
  });

  it('accepts all color modes', () => {
    for (const mode of ['light', 'dark', 'high-contrast']) {
      expect(
        TokenMetadataSchema.parse({
          version: '1.0.0',
          name: 'Test',
          colorMode: mode,
          updatedAt: Date.now(),
        }),
      ).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// TokenDocument Validation
// ---------------------------------------------------------------------------

describe('TokenDocumentSchema', () => {
  it('parses a complete token document', () => {
    const doc: TokenDocument = {
      metadata: {
        version: '1.0.0',
        name: 'Obsidian Cyberpunk',
        colorMode: 'dark',
        updatedAt: Date.now(),
      },
      tokens: {
        color: {
          bg: { primary: { value: '#0f0f23', type: 'color' } },
        },
        space: {
          '4': { value: '16px', type: 'dimension' },
        },
        font: {
          body: { family: { value: 'Inter', type: 'fontFamily' } },
        },
      },
    };
    const result = TokenDocumentSchema.parse(doc);
    expect(result.metadata.name).toBe('Obsidian Cyberpunk');
    expect(result.tokens.color).toBeDefined();
  });

  it('rejects documents without metadata', () => {
    expect(() =>
      TokenDocumentSchema.parse({
        tokens: {
          color: {},
          space: {},
          font: {},
        },
      }),
    ).toThrow();
  });

  it('rejects documents without tokens', () => {
    expect(() =>
      TokenDocumentSchema.parse({
        metadata: {
          version: '1.0.0',
          name: 'Test',
          colorMode: 'dark',
          updatedAt: Date.now(),
        },
      }),
    ).toThrow();
  });
});
