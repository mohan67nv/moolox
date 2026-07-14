/**
 * @moolox/deploy — Static /out Chunk Compiler (Feature: DEP-001)
 *
 * Compiles canonical AST canvas trees (`IASTNode`) and W3C design tokens
 * (`IW3CTokenMap`) into standalone, zero-server-dependency static HTML/CSS/JS bundles.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type IASTNode, type IW3CTokenMap } from '@moolox/types';
import { compileTokenMapToCSS } from '@moolox/tokens';
import { type StaticExportBundle } from '../types';

export interface ExporterOptions {
  /** Page title for `<title>` tag */
  title?: string;
  /** Favicon URL */
  favicon?: string;
  /** Whether to inject interactive runtime event tracking hook */
  injectTelemetry?: boolean;
}

export class StaticExporter {
  async exportBundle(astTree: IASTNode, tokenMap?: IW3CTokenMap, options: ExporterOptions = {}): Promise<StaticExportBundle> {
    const startTime = Date.now();
    let totalNodes = 0;

    // 1. Compile AST node tree to semantic HTML
    const htmlBody = this.compileNodeToHTML(astTree, (count) => {
      totalNodes += count;
    });

    // 2. Compile W3C design tokens to CSS custom properties (< 5ms)
    let tokenCss = '';
    let totalTokensCompiled = 0;
    if (tokenMap) {
      const cssResult = compileTokenMapToCSS(tokenMap);
      tokenCss = cssResult.cssText;
      totalTokensCompiled = Object.keys(cssResult.variables).length;
    }

    // Base responsive CSS reset and theme defaults
    const resetCss = `
/* @moolox/deploy Static Chunk Base System (DEP-001) */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: var(--dios-color-bg-primary, #090d16);
  color: var(--dios-color-fg-primary, #f8fafc);
  line-height: 1.5;
  overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }
img, video { max-width: 100%; height: auto; display: block; }
.dios-canvas-root { min-height: 100vh; display: flex; flex-direction: column; }
`.trim();

    const fullCss = `${resetCss}\n\n/* Compiled Design Tokens (TKN-002) */\n${tokenCss}`.trim();

    // Standalone micro-hydration script for mobile nav toggles & anchor smooth scrolling
    const jsBundle = `
/* @moolox/deploy Runtime Engine */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Moolox Dios Engine] Hydrated static canvas artifact (\\'DEP-001\\'). Nodes: ' + ${totalNodes});
    const buttons = document.querySelectorAll('button[data-action]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action === 'scroll-top') window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  });
})();
`.trim();

    const pageTitle = options.title || 'Moolox Digital Studio Artifact';
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${this.escapeHTML(pageTitle)}</title>
  ${options.favicon ? `<link rel="icon" href="${this.escapeHTML(options.favicon)}" />` : ''}
  <style>
${fullCss}
  </style>
</head>
<body>
  <div id="dios-app-root" class="dios-canvas-root">
${htmlBody}
  </div>
  <script>
${jsBundle}
  </script>
</body>
</html>`.trim();

    const bundleId = `bnd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const hash = this.computeFastHash(fullHtml);
    const sizeBytes = new TextEncoder().encode(fullHtml).length;
    const compileDurationMs = Date.now() - startTime;

    return {
      bundleId,
      html: fullHtml,
      css: fullCss,
      js: jsBundle,
      hash,
      timestamp: Date.now(),
      metadata: {
        totalNodes,
        totalTokensCompiled,
        sizeBytes,
        compileDurationMs,
      },
    };
  }

  private compileNodeToHTML(node: IASTNode, onNodeCount: (n: number) => void): string {
    if (!node) return '';
    onNodeCount(1);

    const tag = this.sanitizeTagName(node.type);
    const props = node.props || {};
    const styles = node.styles || {};

    // Build attribute string
    const attrs: string[] = [];
    if (node.nodeId) attrs.push(`id="${this.escapeHTML(node.nodeId)}"`);
    if (props.className) attrs.push(`class="${this.escapeHTML(String(props.className))}"`);
    if (props.href) attrs.push(`href="${this.escapeHTML(String(props.href))}"`);
    if (props.src) attrs.push(`src="${this.escapeHTML(String(props.src))}"`);
    if (props.alt) attrs.push(`alt="${this.escapeHTML(String(props.alt))}"`);
    if (props.role) attrs.push(`role="${this.escapeHTML(String(props.role))}"`);
    if (props['aria-label']) attrs.push(`aria-label="${this.escapeHTML(String(props['aria-label']))}"`);

    // Inline style rules
    if (Object.keys(styles).length > 0) {
      const styleStr = Object.entries(styles)
        .map(([k, v]) => `${this.camelToKebab(k)}: ${v}`)
        .join('; ');
      attrs.push(`style="${this.escapeHTML(styleStr)}"`);
    }

    const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    // Void elements (<img /> etc)
    const voidTags = new Set(['img', 'input', 'hr', 'br', 'meta', 'link']);
    if (voidTags.has(tag)) {
      return `    <${tag}${attrString} />`;
    }

    // Children & Text Content
    let innerContent = '';
    if (typeof props.content === 'string' && props.content) {
      innerContent = this.escapeHTML(String(props.content));
    } else if (node.children && node.children.length > 0) {
      innerContent = '\n' + node.children.map((c) => this.compileNodeToHTML(c, onNodeCount)).join('\n') + '\n    ';
    }

    return `    <${tag}${attrString}>${innerContent}</${tag}>`;
  }

  private sanitizeTagName(type: string): string {
    const cleaned = type.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleaned) return 'div';
    // Map custom component names to semantic HTML elements if needed
    if (cleaned === 'hero' || cleaned === 'section') return 'section';
    if (cleaned === 'navigation' || cleaned === 'nav') return 'nav';
    if (cleaned === 'footer') return 'footer';
    return cleaned;
  }

  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private computeFastHash(data: string): string {
    let hash = 2166136261;
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return `fnv-${(hash >>> 0).toString(16)}`;
  }
}
