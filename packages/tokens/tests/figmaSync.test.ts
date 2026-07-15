import { describe, it, expect } from 'vitest';
import {
  FigmaVariableSyncEngine,
  type FigmaVariableExportPayload,
} from '../src/figma/figmaSyncEngine';
import { type IW3CTokenMap } from '@moolox/types';

describe('Figma Design Token & Variable Synchronizer (`TKN-005`)', () => {
  const figmaPayload: FigmaVariableExportPayload = {
    version: '1.0.0',
    modes: { 'mode-light': 'Light' },
    variables: [
      {
        id: 'var-col-1',
        name: 'Color/Bg/Primary',
        resolvedType: 'COLOR',
        valuesByMode: { 'mode-light': '#0f172a' },
      },
      {
        id: 'var-dim-2',
        name: 'Spacing/Large',
        resolvedType: 'FLOAT',
        valuesByMode: { 'mode-light': 24 },
      },
    ],
  };

  const baseStrictTokenMap: IW3CTokenMap = {
    '$schema': 'https://w3c.github.io/design-tokens/',
    'color': {
      'bg': {
        'primary': { '$value': '#0f172a', '$type': 'color' },
      },
      'accent': {
        'error': { '$value': '#ef4444', '$type': 'color' },
      },
    },
  };

  it('imports Figma variables into canonical W3C design token JSON (`TKN-005`, `TKN-001`)', () => {
    const res = FigmaVariableSyncEngine.importFromFigmaJSON(figmaPayload);
    expect(res.importedVariablesCount).toBe(2);

    const map = res.tokenMap as Record<string, any>;
    expect(map.color.bg.primary.$value).toBe('#0f172a');
    expect(map.color.bg.primary.$type).toBe('color');

    expect(map.spacing.large.$value).toBe('24px');
    expect(map.spacing.large.$type).toBe('dimension');
  });

  it('enforces the Zero-Hex Law (`TKN-003`) when importing raw hex strings into strict base maps', () => {
    const dirtyPayload: FigmaVariableExportPayload = {
      version: '1.0.0',
      modes: { 'mode-1': 'Default' },
      variables: [
        {
          id: 'var-dirty-hex',
          name: 'Color/Custom/BadHex',
          resolvedType: 'COLOR',
          valuesByMode: { 'mode-1': '#ff0000' }, // Ad-hoc hex string
        },
      ],
    };

    const res = FigmaVariableSyncEngine.importFromFigmaJSON(dirtyPayload, baseStrictTokenMap);
    expect(res.importedVariablesCount).toBe(1);
    expect(res.violationsFixed).toBe(1); // Enforce resolution triggered
  });

  it('exports canonical W3C design token JSON to a Figma variable payload (`TKN-005`)', () => {
    const w3cTokens: IW3CTokenMap = {
      '$schema': 'https://w3c.github.io/design-tokens/',
      'color': {
        'brand': {
          'primary': { '$value': '#6366f1', '$type': 'color' },
        },
      },
      'space': {
        '4': { '$value': '16px', '$type': 'dimension' },
      },
    };

    const exported = FigmaVariableSyncEngine.exportToFigmaJSON(w3cTokens, 'Canonical Light');
    expect(exported.version).toBe('1.0.0');
    expect(exported.variables.length).toBe(2);

    const brandCol = exported.variables.find((v) => v.name === 'Color/Brand/Primary');
    expect(brandCol?.resolvedType).toBe('COLOR');
    expect(brandCol?.valuesByMode['mode-canonical-1']).toBe('#6366f1');

    const spaceDim = exported.variables.find((v) => v.name === 'Space/4');
    expect(spaceDim?.resolvedType).toBe('FLOAT');
    expect(spaceDim?.valuesByMode['mode-canonical-1']).toBe(16);
  });
});
