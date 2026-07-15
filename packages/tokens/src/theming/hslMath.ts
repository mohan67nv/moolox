/**
 * @moolox/tokens — Perceptual HSL & WCAG Contrast Math Engine (TKN-004)
 *
 * Provides exact RGB <-> HSL conversions, relative luminance (`L`), and
 * WCAG 2.1 AA/AAA contrast ratio verification (`>= 4.5:1`). Used by
 * ThemeInverterEngine for 1-click `light <-> dark <-> high-contrast` switching.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  /** Hue [0, 360) */
  h: number;
  /** Saturation [0, 100] */
  s: number;
  /** Luminance / Lightness [0, 100] */
  l: number;
}

/**
 * Normalizes any 3, 4, 6, or 8 digit hex code into a clean 6-digit `#RRGGBB` string.
 */
export function normalizeHex(hex: string): string {
  let clean = hex.trim();
  if (clean.startsWith('#')) clean = clean.slice(1);
  if (clean.length === 3 || clean.length === 4) {
    clean = clean[0]! + clean[0]! + clean[1]! + clean[1]! + clean[2]! + clean[2]!;
  }
  return '#' + clean.slice(0, 6).toLowerCase();
}

/**
 * Converts `#RRGGBB` hex string to RGB structure.
 */
export function hexToRgb(hex: string): RGBColor | null {
  const clean = normalizeHex(hex).slice(1);
  if (clean.length !== 6) return null;
  const num = Number.parseInt(clean, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB structure `(0-255)` to `#RRGGBB` hex string.
 */
export function rgbToHex({ r, g, b }: RGBColor): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
  ).toLowerCase();
}

/**
 * Converts RGB structure to HSL `(h: 0-360, s: 0-100, l: 0-100)`.
 */
export function rgbToHsl({ r, g, b }: RGBColor): HSLColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL structure back to RGB structure `(0-255)`.
 */
export function hslToRgb({ h, s, l }: HSLColor): RGBColor {
  const hNorm = ((h % 360) + 360) % 360 / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const hueToRgb = (pVal: number, qVal: number, tVal: number) => {
    let t = tVal;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return pVal + (qVal - pVal) * 6 * t;
    if (t < 1 / 2) return qVal;
    if (t < 2 / 3) return pVal + (qVal - pVal) * (2 / 3 - t) * 6;
    return pVal;
  };

  return {
    r: Math.round(hueToRgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hNorm) * 255),
    b: Math.round(hueToRgb(p, q, hNorm - 1 / 3) * 255),
  };
}

/**
 * Converts hex directly to HSL.
 */
export function hexToHsl(hex: string): HSLColor | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb);
}

/**
 * Converts HSL directly to hex.
 */
export function hslToHex(hsl: HSLColor): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Calculates WCAG 2.1 relative luminance of an RGB color `[0, 1]`.
 */
export function calculateRelativeLuminance({ r, g, b }: RGBColor): number {
  const normalizeChannel = (c: number) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * normalizeChannel(r) +
    0.7152 * normalizeChannel(g) +
    0.0722 * normalizeChannel(b)
  );
}

/**
 * Calculates WCAG 2.1 contrast ratio between two `#RRGGBB` hex colors.
 * Returns value from `1.0` (identical) up to `21.0` (black vs white).
 */
export function calculateContrastRatio(hexA: string, hexB: string): number {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return 1.0;

  const lumA = calculateRelativeLuminance(rgbA);
  const lumB = calculateRelativeLuminance(rgbB);

  const L1 = Math.max(lumA, lumB);
  const L2 = Math.min(lumA, lumB);

  return Number(((L1 + 0.05) / (L2 + 0.05)).toFixed(2));
}

/**
 * Checks if contrast ratio meets WCAG 2.1 AA (`>= 4.5:1` for normal text).
 */
export function passesWcagAA(hexFg: string, hexBg: string): boolean {
  return calculateContrastRatio(hexFg, hexBg) >= 4.5;
}
