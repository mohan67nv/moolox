import { describe, it, expect } from 'vitest';
import {
  getActiveBreakpoint,
  computeColumnWidthPct,
  calculateGridColumnSpan,
  generateResponsiveGridClass,
  parseResponsiveGridClasses,
} from '../src/viewport/breakpointMath';

describe('CNV-005: Breakpoint & Responsive Grid Layout Math Engine', () => {
  it('should accurately resolve active viewport breakpoints by width in px', () => {
    expect(getActiveBreakpoint(375).id).toBe('mobile');
    expect(getActiveBreakpoint(768).id).toBe('tablet');
    expect(getActiveBreakpoint(1440).id).toBe('desktop');
    expect(getActiveBreakpoint(1920).id).toBe('wide');
  });

  it('should calculate exact percentage widths for grid column spans', () => {
    expect(computeColumnWidthPct(6, 12)).toBe(50.0);
    expect(computeColumnWidthPct(4, 12)).toBe(33.33);
    expect(computeColumnWidthPct(12, 12)).toBe(100.0);
  });

  it('should compute new column span during horizontal drag deltas cleanly', () => {
    // Container width = 1200px (100px per column out of 12)
    const newSpan = calculateGridColumnSpan(200, 1200, 4, 12); // Drag right 200px -> +2 cols
    expect(newSpan).toBe(6);

    const shrinkSpan = calculateGridColumnSpan(-300, 1200, 6, 12); // Drag left 300px -> -3 cols
    expect(shrinkSpan).toBe(3);
  });

  it('should generate and parse clean responsive grid class maps', () => {
    const map = { mobile: 1, tablet: 2, desktop: 3, wide: 4 };
    const cssClass = generateResponsiveGridClass(map);
    expect(cssClass).toBe('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4');

    const parsed = parseResponsiveGridClasses(cssClass);
    expect(parsed.mobile).toBe(1);
    expect(parsed.tablet).toBe(2);
    expect(parsed.desktop).toBe(3);
    expect(parsed.wide).toBe(4);
  });
});
