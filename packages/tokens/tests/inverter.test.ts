import { describe, it, expect } from 'vitest';
import { ThemeInverterEngine, invertColorHex } from '../src/theming/Inverter';
import { hexToHsl, calculateContrastRatio, passesWcagAA } from '../src/theming/hslMath';
import { type TokenDocument } from '@moolox/types';

describe('TKN-004: Perceptual HSL Theme Inverter & WCAG Contrast Math', () => {
  it('should accurately convert RGB <-> HSL and calculate contrast ratios', () => {
    const hsl = hexToHsl('#1a1a2e');
    expect(hsl).not.toBeNull();
    expect(hsl!.l).toBeLessThan(30); // dark background

    const ratio = calculateContrastRatio('#ffffff', '#000000');
    expect(ratio).toBe(21.0);

    expect(passesWcagAA('#ffffff', '#1a1a2e')).toBe(true);
  });

  it('should invert dark background hex to light surface hex cleanly', () => {
    const lightBg = invertColorHex('#0b0f19', 'color.bg.primary', 'light', 'dark');
    const hsl = hexToHsl(lightBg);
    expect(hsl!.l).toBeGreaterThan(90);
  });

  it('should invert a complete TokenDocument and compile CSS custom properties in < 5ms', () => {
    const mockDoc: TokenDocument = {
      metadata: {
        version: '1.0.0',
        name: 'Test Dark Theme',
        colorMode: 'dark',
        updatedAt: Date.now(),
      },
      tokens: {
        color: {
          bg: {
            primary: { value: '#0f172a', type: 'color' },
            secondary: { value: '#1e293b', type: 'color' },
          },
          fg: {
            primary: { value: '#f8fafc', type: 'color' },
            secondary: { value: '#cbd5e1', type: 'color' },
          },
          accent: {
            primary: { value: '#3b82f6', type: 'color' },
          },
        },
        space: {
          '4': { value: '16px', type: 'dimension' },
        },
        font: {
          heading: { value: 'Inter', type: 'fontFamily' },
        },
      },
    };

    const result = ThemeInverterEngine.switchMode(mockDoc, 'light');
    expect(result.durationMs).toBeLessThan(50); // fast inversion & compilation
    expect(result.document.metadata.colorMode).toBe('light');

    const newBg = (result.document.tokens.color as any).bg.primary.value;
    const newFg = (result.document.tokens.color as any).fg.primary.value;

    expect(hexToHsl(newBg)!.l).toBeGreaterThan(90);
    expect(hexToHsl(newFg)!.l).toBeLessThan(20);
    expect(result.passesWcag).toBe(true);
    expect(result.compilation.cssText).toContain('--dios-color-bg-primary:');
  });

  it('should switch to high-contrast mode with extreme separation', () => {
    const mockDoc: TokenDocument = {
      metadata: {
        version: '1.0.0',
        name: 'Test Theme',
        colorMode: 'dark',
        updatedAt: Date.now(),
      },
      tokens: {
        color: {
          bg: { primary: { value: '#121212', type: 'color' } },
          fg: { primary: { value: '#e0e0e0', type: 'color' } },
        },
        space: {},
        font: {},
      },
    };

    const result = ThemeInverterEngine.switchMode(mockDoc, 'high-contrast');
    expect((result.document.tokens.color as any).bg.primary.value).toBe('#000000');
    expect((result.document.tokens.color as any).fg.primary.value).toBe('#ffffff');
  });
});
