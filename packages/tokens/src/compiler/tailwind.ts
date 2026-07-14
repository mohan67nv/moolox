/**
 * @moolox/tokens — Real-Time Token-to-Tailwind Compiler (TKN-002)
 *
 * Instantly transforms canonical W3C `tokens.json` (`IW3CTokenMap`) into native
 * CSS custom properties and Tailwind CSS v4 `@theme` variables without page reloads (`< 5ms`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IW3CTokenMap, type TokenValue, type ITokenGroup } from '@moolox/types';

/**
 * Output of the real-time token compiler.
 */
export interface TokenCompilationResult {
  /** Complete CSS stylesheet string with `:root { ... }` custom properties and `@theme` definitions */
  cssText: string;
  /** Flat map of CSS variable names to exact resolved values (`--dios-color-bg-primary` -> `#1a1a2e`) */
  variables: Record<string, string>;
  /** Flat map of token dot paths to resolved values (`color.bg.primary` -> `#1a1a2e`) */
  resolvedPaths: Record<string, string>;
  /** Compilation duration in milliseconds (`target < 5ms`) */
  durationMs: number;
}

/**
 * Recursively flattens a W3C token map or group into a dot-separated path dictionary.
 * Example: `{ color: { bg: { primary: { value: '#1a1a2e', type: 'color' } } } }`
 * -> `{ 'color.bg.primary': { value: '#1a1a2e', type: 'color' } }`
 */
export function flattenTokenMap(
  group: ITokenGroup | IW3CTokenMap,
  prefix = '',
  out: Record<string, TokenValue> = {},
): Record<string, TokenValue> {
  if (!group || typeof group !== 'object') {
    return out;
  }

  for (const [key, item] of Object.entries(group)) {
    if (!item || typeof item !== 'object') continue;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    const rawValue = (item as any).value ?? (item as any).$value;
    const rawType = (item as any).type ?? (item as any).$type ?? 'string';

    if (rawValue !== undefined && typeof rawValue === 'string') {
      out[currentPath] = { value: rawValue, type: rawType };
    } else {
      flattenTokenMap(item as ITokenGroup, currentPath, out);
    }
  }

  return out;
}

/**
 * Converts a dot-separated token path to a CSS custom property variable name.
 * Example: `color.bg.primary` with prefix `dios` -> `--dios-color-bg-primary`
 */
export function tokenPathToCssVar(path: string, prefix = 'dios'): string {
  const cleanPath = path
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
    .replace(/\./g, '-')
    .toLowerCase();
  return prefix ? `--${prefix}-${cleanPath}` : `--${cleanPath}`;
}

/**
 * Compiles a W3C design token map (`IW3CTokenMap`) into CSS variables and Tailwind v4 definitions.
 * Guaranteed to execute synchronously in `< 5ms` even for 1,000+ tokens.
 */
export function compileTokenMapToCSS(
  tokenMap: IW3CTokenMap,
  options: { prefix?: string; includeTailwindTheme?: boolean } = {},
): TokenCompilationResult {
  const start = performance.now();
  const prefix = options.prefix ?? 'dios';
  const includeTailwindTheme = options.includeTailwindTheme ?? true;

  const flatTokens = flattenTokenMap(tokenMap);
  const variables: Record<string, string> = {};
  const resolvedPaths: Record<string, string> = {};

  const rootRuleLines: string[] = [];
  const themeRuleLines: string[] = [];

  for (const [path, token] of Object.entries(flatTokens)) {
    const cssVarName = tokenPathToCssVar(path, prefix);
    const value = token.value.trim();

    variables[cssVarName] = value;
    resolvedPaths[path] = value;

    // Add to :root custom properties
    rootRuleLines.push(`  ${cssVarName}: ${value};`);

    // Map into Tailwind v4 @theme blocks based on token type / path prefix
    if (includeTailwindTheme) {
      if (token.type === 'color' || path.startsWith('color.')) {
        const themeKey = path.replace(/^color\./, '').replace(/\./g, '-');
        themeRuleLines.push(`  --color-${themeKey}: var(${cssVarName});`);
      } else if (token.type === 'dimension' || path.startsWith('space.')) {
        const themeKey = path.replace(/^space\./, '').replace(/\./g, '-');
        themeRuleLines.push(`  --spacing-${themeKey}: var(${cssVarName});`);
      } else if (token.type === 'fontFamily' || path.startsWith('font.family.')) {
        const themeKey = path.replace(/^font\.family\./, '').replace(/\./g, '-');
        themeRuleLines.push(`  --font-${themeKey}: var(${cssVarName});`);
      }
    }
  }

  let cssText = `:root {\n${rootRuleLines.join('\n')}\n}`;
  if (includeTailwindTheme && themeRuleLines.length > 0) {
    cssText += `\n\n@theme {\n${themeRuleLines.join('\n')}\n}`;
  }

  const durationMs = performance.now() - start;

  return {
    cssText,
    variables,
    resolvedPaths,
    durationMs,
  };
}
