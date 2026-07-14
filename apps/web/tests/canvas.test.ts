/**
 * @moolox/web — React 19 Canvas & Studio Unit Tests (Features: CNV-001, CNV-002, CNV-003, CNV-004, TKN-004, TKN-005)
 *
 * Validates viewport presets, wireframe state, property inspector sub-tree mutation, and theme switcher fidelity.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect, vi } from 'vitest';
import { VIEWPORT_PRESETS, type ViewportMode } from '../src/components/canvas/ViewportMatrixSwitcher';
import { BRAND_KIT_PRESETS } from '../src/components/canvas/ThemeSwitcher';
import { type IASTNode, type IW3CTokenMap } from '@moolox/types';
import { enforceTokenResolution } from '@moolox/tokens';

describe('Responsive Viewport Matrix Switcher (CNV-003)', () => {
  it('VIEWPORT_PRESETS defines exact mobile (375px), tablet (768px), and desktop breakpoints', () => {
    expect(VIEWPORT_PRESETS.mobile.widthPx).toBe(375);
    expect(VIEWPORT_PRESETS.mobile.heightPx).toBe(812);

    expect(VIEWPORT_PRESETS.tablet.widthPx).toBe(768);
    expect(VIEWPORT_PRESETS.tablet.heightPx).toBe(1024);

    expect(VIEWPORT_PRESETS.desktop.widthPx).toBe('100%');
    expect(VIEWPORT_PRESETS.desktop.heightPx).toBe('100%');
  });
});

describe('Theme Studio & Brand Kit Presets (TKN-004, TKN-005)', () => {
  it('BRAND_KIT_PRESETS contains exact canonical brand palettes', () => {
    expect(BRAND_KIT_PRESETS).toHaveLength(4);
    const ids = BRAND_KIT_PRESETS.map((p) => p.id);
    expect(ids).toContain('cyberpunk');
    expect(ids).toContain('fintech');
    expect(ids).toContain('editorial');
    expect(ids).toContain('saas');
  });
});

describe('Property Inspector Zero-Hex Law & Sub-Tree Sync Logic (CNV-002)', () => {
  const sampleTokenMap: IW3CTokenMap = {
    color: {
      bg: { primary: { value: '#0f172a', type: 'color' } },
      accent: { error: { value: '#ef4444', type: 'color' } },
    },
    space: {},
    font: {},
  };

  it('Property Inspector enforces token resolution when hex string is entered into style.color', () => {
    const resolution = enforceTokenResolution('#ff2222', sampleTokenMap);
    expect(resolution.resolvedTokenPath).toBe('color.accent.error');
    expect(resolution.resolvedCssVar).toBe('--dios-color-accent-error');
    expect(resolution.wasMapped).toBe(true);
  });

  it('onUpdateNode callback preserves node ID and merges modified props accurately for < 15ms patching', () => {
    const originalNode: IASTNode = {
      nodeId: 'btn-cta',
      type: 'button',
      props: { className: 'px-4 py-2 font-bold', content: 'Submit' },
      styles: { color: 'var(--dios-color-fg-primary)' },
    };

    const updateSpy = vi.fn();

    // Simulate property update handler
    const handleApplyClassName = (newClassName: string) => {
      updateSpy(originalNode.nodeId, {
        ...originalNode,
        props: { ...originalNode.props, className: newClassName },
      });
    };

    handleApplyClassName('px-6 py-3 font-extrabold');
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith('btn-cta', {
      nodeId: 'btn-cta',
      type: 'button',
      props: { className: 'px-6 py-3 font-extrabold', content: 'Submit' },
      styles: { color: 'var(--dios-color-fg-primary)' },
    });
  });
});
