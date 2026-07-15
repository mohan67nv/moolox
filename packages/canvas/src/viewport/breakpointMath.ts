/**
 * @moolox/canvas — Breakpoint & Responsive Grid Layout Math Engine (CNV-005)
 *
 * Calculates precise viewport pixel boundaries (`375px`, `768px`, `1440px`, `1920px`)
 * and interactive grid column span calculations (`1..12 cols`) during live splitter drags.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export type ViewportBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface BreakpointDimension {
  id: ViewportBreakpoint;
  name: string;
  minWidthPx: number;
  maxWidthPx: number;
  defaultCols: number;
  tailwindPrefix: string;
}

export const BREAKPOINT_REGISTRY: Record<ViewportBreakpoint, BreakpointDimension> = {
  mobile: {
    id: 'mobile',
    name: 'Mobile (375px)',
    minWidthPx: 320,
    maxWidthPx: 639,
    defaultCols: 1,
    tailwindPrefix: '',
  },
  tablet: {
    id: 'tablet',
    name: 'Tablet (768px)',
    minWidthPx: 640,
    maxWidthPx: 1023,
    defaultCols: 2,
    tailwindPrefix: 'sm:',
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop (1440px)',
    minWidthPx: 1024,
    maxWidthPx: 1535,
    defaultCols: 3,
    tailwindPrefix: 'lg:',
  },
  wide: {
    id: 'wide',
    name: 'Wide (1920px)',
    minWidthPx: 1536,
    maxWidthPx: 3840,
    defaultCols: 4,
    tailwindPrefix: '2xl:',
  },
};

/**
 * Returns the active breakpoint given a viewport width in pixels.
 */
export function getActiveBreakpoint(viewportWidthPx: number): BreakpointDimension {
  if (viewportWidthPx < 640) return BREAKPOINT_REGISTRY.mobile;
  if (viewportWidthPx < 1024) return BREAKPOINT_REGISTRY.tablet;
  if (viewportWidthPx < 1536) return BREAKPOINT_REGISTRY.desktop;
  return BREAKPOINT_REGISTRY.wide;
}

/**
 * Computes exact percentage width of a column span out of `totalCols`.
 */
export function computeColumnWidthPct(colSpan: number, totalCols = 12): number {
  const clamp = Math.max(1, Math.min(totalCols, Math.round(colSpan)));
  return Number(((clamp / totalCols) * 100).toFixed(2));
}

/**
 * Calculates new grid column span (`1..totalCols`) based on horizontal drag delta (`deltaXPx`).
 */
export function calculateGridColumnSpan(
  deltaXPx: number,
  containerWidthPx: number,
  currentColSpan: number,
  totalCols = 12,
): number {
  if (containerWidthPx <= 0) return Math.max(1, Math.min(totalCols, currentColSpan));

  const colWidthPx = containerWidthPx / totalCols;
  const deltaCols = Math.round(deltaXPx / colWidthPx);
  const newSpan = currentColSpan + deltaCols;

  return Math.max(1, Math.min(totalCols, newSpan));
}

/**
 * Generates a clean Tailwind CSS responsive grid class string from a column span map (`CNV-005`).
 * Example: `{ mobile: 1, tablet: 2, desktop: 3 }` -> `"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"`
 */
export function generateResponsiveGridClass(
  colSpanMap: Partial<Record<ViewportBreakpoint, number>>,
): string {
  const classes: string[] = ['grid'];

  if (colSpanMap.mobile) {
    classes.push(`grid-cols-${Math.max(1, Math.min(12, colSpanMap.mobile))}`);
  } else {
    classes.push('grid-cols-1');
  }

  if (colSpanMap.tablet) {
    classes.push(`sm:grid-cols-${Math.max(1, Math.min(12, colSpanMap.tablet))}`);
  }

  if (colSpanMap.desktop) {
    classes.push(`lg:grid-cols-${Math.max(1, Math.min(12, colSpanMap.desktop))}`);
  }

  if (colSpanMap.wide) {
    classes.push(`2xl:grid-cols-${Math.max(1, Math.min(12, colSpanMap.wide))}`);
  }

  return classes.join(' ');
}

/**
 * Parses existing `className` string to extract responsive `grid-cols-*` map.
 */
export function parseResponsiveGridClasses(className: string): Partial<Record<ViewportBreakpoint, number>> {
  const map: Partial<Record<ViewportBreakpoint, number>> = {};
  const tokens = className.split(/\s+/);

  for (const token of tokens) {
    const matchBase = /^grid-cols-(\d+)$/.exec(token);
    if (matchBase && matchBase[1]) {
      map.mobile = Number.parseInt(matchBase[1], 10);
    }
    const matchSm = /^sm:grid-cols-(\d+)$/.exec(token);
    if (matchSm && matchSm[1]) {
      map.tablet = Number.parseInt(matchSm[1], 10);
    }
    const matchLg = /^lg:grid-cols-(\d+)$/.exec(token);
    if (matchLg && matchLg[1]) {
      map.desktop = Number.parseInt(matchLg[1], 10);
    }
    const match2xl = /^2xl:grid-cols-(\d+)$/.exec(token);
    if (match2xl && match2xl[1]) {
      map.wide = Number.parseInt(match2xl[1], 10);
    }
  }

  return map;
}
