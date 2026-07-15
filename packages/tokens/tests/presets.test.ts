import { describe, it, expect } from 'vitest';
import { BRAND_PRESETS_REGISTRY, getBrandPresetById } from '../src/presets';
import { compileTokenMapToCSS } from '../src/compiler/tailwind';
import { checkWcagCompliance } from '../src/theming/Inverter';

describe('CMP-002: 50 Obsidian Brand Presets Registry', () => {
  it('should contain exactly 50 distinct brand presets with unique IDs', () => {
    expect(BRAND_PRESETS_REGISTRY.length).toBe(50);

    const ids = new Set(BRAND_PRESETS_REGISTRY.map((p) => p.id));
    expect(ids.size).toBe(50);
  });

  it('should compile any brand preset into CSS custom properties in < 50ms', () => {
    for (const preset of BRAND_PRESETS_REGISTRY) {
      const start = performance.now();
      const res = compileTokenMapToCSS(preset.tokens, { prefix: 'dios' });
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(50);
      expect(res.cssText).toContain('--dios-color-bg-primary:');
      expect(res.cssText).toContain('--dios-color-accent-primary:');
    }
  });

  it('should retrieve presets by ID cleanly or return default', () => {
    const tokyo = getBrandPresetById('tokyo-neon');
    expect(tokyo.name).toBe('Tokyo Neon');

    const unknown = getBrandPresetById('non-existent');
    expect(unknown.id).toBe('cyberpunk-dark');
  });

  it('should verify that primary bg and fg of all presets are well-formed hex strings', () => {
    for (const preset of BRAND_PRESETS_REGISTRY) {
      expect(preset.primaryBg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.primaryAccent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof preset.description).toBe('string');
      expect(preset.description.length).toBeGreaterThan(5);
    }
  });
});
