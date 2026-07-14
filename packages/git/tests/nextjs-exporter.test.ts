/**
 * @moolox/git — Next.js Exporter Tests (GIT-002)
 */

import { describe, it, expect } from 'vitest';
import { exportToNextJS, type NextJSExportOptions } from '../src/export/nextjs-exporter';
import type { IASTNode, TokenDocument } from '@moolox/types';

const mockAstRoot: IASTNode = {
  nodeId: 'node-root-123',
  type: 'div',
  props: { className: 'container mx-auto p-4' },
  styles: { 'color.bg.primary': 'bg-slate-900' },
  children: [
    {
      nodeId: 'node-header-101',
      type: 'h1',
      props: { className: 'text-4xl font-bold' },
      styles: { 'color.text.heading': 'text-white' },
      children: [
        {
          nodeId: 'node-text-001',
          type: 'text',
          props: { content: 'Welcome to Moolox' },
          styles: {},
        },
      ],
    },
  ],
};

const mockTokens: TokenDocument = {
  $schema: 'https://design-tokens.github.io/community-group/format/',
  metadata: {
    name: 'Brand Presets Test',
    version: '1.0.0',
  },
  tokenMap: {
    color: {
      bg: {
        primary: {
          $value: '#0f172a',
          $type: 'color',
        },
      },
      text: {
        heading: {
          $value: '#ffffff',
          $type: 'color',
        },
      },
    },
  },
};

const exportOptions: NextJSExportOptions = {
  projectId: 'proj-123',
  versionNum: 5,
  projectName: 'My Awesome Website',
  projectSlug: 'my-awesome-website',
};

describe('Next.js Standalone Code Exporter (GIT-002)', () => {
  it('generates a complete standalone Next.js App Router manifest', () => {
    const manifest = exportToNextJS(mockAstRoot, mockTokens, exportOptions);

    expect(manifest.projectId).toBe('proj-123');
    expect(manifest.versionNum).toBe(5);
    expect(manifest.totalFiles).toBeGreaterThanOrEqual(8);
    expect(manifest.totalBytes).toBeGreaterThan(0);
    expect(manifest.generationMs).toBeGreaterThanOrEqual(0);

    const files = manifest.files;
    expect(files['package.json']).toBeDefined();
    expect(files['tsconfig.json']).toBeDefined();
    expect(files['next.config.js']).toBeDefined();
    expect(files['src/styles/tokens.css']).toBeDefined();
    expect(files['src/styles/globals.css']).toBeDefined();
    expect(files['src/app/layout.tsx']).toBeDefined();
    expect(files['src/app/page.tsx']).toBeDefined();
    expect(files['README.md']).toBeDefined();
    expect(files['.gitignore']).toBeDefined();
  });

  it('generates clean package.json with correct dependencies', () => {
    const manifest = exportToNextJS(mockAstRoot, mockTokens, exportOptions);
    const pkgJson = JSON.parse(manifest.files['package.json']!);

    expect(pkgJson.name).toBe('my-awesome-website');
    expect(pkgJson.dependencies.next).toBeDefined();
    expect(pkgJson.dependencies.react).toBeDefined();
    expect(pkgJson.dependencies['react-dom']).toBeDefined();
    // Zero Moolox runtime dependencies
    expect(pkgJson.dependencies['@moolox/ast-core']).toBeUndefined();
    expect(pkgJson.dependencies['@moolox/tokens']).toBeUndefined();
  });

  it('compiles design tokens to valid CSS variables in tokens.css', () => {
    const manifest = exportToNextJS(mockAstRoot, mockTokens, exportOptions);
    const tokensCss = manifest.files['src/styles/tokens.css']!;

    expect(tokensCss).toContain(':root {');
    expect(tokensCss).toContain('--dios-color-bg-primary: #0f172a;');
    expect(tokensCss).toContain('--dios-color-text-heading: #ffffff;');
  });

  it('serializes AST into clean React page component in page.tsx', () => {
    const manifest = exportToNextJS(mockAstRoot, mockTokens, exportOptions);
    const pageTsx = manifest.files['src/app/page.tsx']!;

    expect(pageTsx).toContain("import React from 'react';");
    expect(pageTsx).toContain('export default function HomePage() {');
    expect(pageTsx).toContain('<div className="container mx-auto p-4">');
    expect(pageTsx).toContain('<h1 className="text-4xl font-bold">Welcome to Moolox</h1>');
    // Ensure no internal data-node-ids on exported clean code
    expect(pageTsx).not.toContain('data-node-id=');
  });

  it('respects basePath option if provided', () => {
    const manifest = exportToNextJS(mockAstRoot, mockTokens, {
      ...exportOptions,
      basePath: 'export-bundle',
    });

    expect(manifest.files['export-bundle/package.json']).toBeDefined();
    expect(manifest.files['export-bundle/src/app/page.tsx']).toBeDefined();
  });
});
