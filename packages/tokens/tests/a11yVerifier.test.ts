import { describe, it, expect } from 'vitest';
import {
  WCAGAccessibilityVerifier,
  RequiredCIGateChecker,
} from '../src/theming/a11yVerifier';
import { type IW3CTokenMap } from '@moolox/types';

describe('WCAG 2.2 AA Accessibility & CI Verification Gate (A11Y-001, TST-001)', () => {
  describe('WCAGAccessibilityVerifier (A11Y-001)', () => {
    it('passes token palette when foreground and background contrast ratio >= 4.5:1', () => {
      const goodTokenMap: IW3CTokenMap = {
        color: {
          foreground: '#ffffff', // white
          background: '#000000', // black -> 21:1 contrast
        },
      };

      const report = WCAGAccessibilityVerifier.auditTokenPalette(goodTokenMap, 'preset-good');
      expect(report.passed).toBe(true);
      expect(report.violationsCount).toBe(0);
      expect(report.wcagComplianceLevel).toBe('WCAG 2.2 AA');
    });

    it('fails token palette and reports violation when contrast ratio < 4.5:1', () => {
      const badTokenMap: IW3CTokenMap = {
        color: {
          foreground: '#777777', // mid-gray
          background: '#888888', // slightly lighter mid-gray -> very low contrast (~1.1:1)
        },
      };

      const report = WCAGAccessibilityVerifier.auditTokenPalette(badTokenMap, 'preset-bad');
      expect(report.passed).toBe(false);
      expect(report.violationsCount).toBe(1);
      expect(report.violations[0].actualContrastRatio).toBeLessThan(4.5);
      expect(report.wcagComplianceLevel).toBe('FAILED');
    });
  });

  describe('RequiredCIGateChecker (TST-001)', () => {
    it('sweeps all 50 Obsidian brand presets and verifies CI pass criteria', () => {
      const sweep = RequiredCIGateChecker.runAllPresetsSweep();
      expect(sweep.totalPresetsAudited).toBe(50);
      expect(sweep.passed).toBe(true);
      expect(sweep.failedPresets).toBe(0);
    });
  });
});
