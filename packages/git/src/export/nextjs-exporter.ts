/**
 * @moolox/git — Standalone Next.js 15 App Router Code Exporter (GIT-002)
 *
 * Converts a Moolox project's AST tree and design tokens into a clean,
 * buildable Next.js 15 App Router project with zero Moolox runtime dependencies.
 *
 * Exported structure:
 *   /src/app/layout.tsx       — Root layout with <html>, <head>, CSS import
 *   /src/app/page.tsx         — Main page component
 *   /src/styles/tokens.css    — Design tokens compiled to CSS custom properties
 *   /package.json             — Minimal Next.js dependencies
 *   /tsconfig.json            — TypeScript configuration
 *   /next.config.js           — Next.js configuration
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import type { IASTNode, ICodeExportManifest, TokenDocument } from '@moolox/types';
import { serializeAST } from '@moolox/ast-core';
import { compileTokenMapToCSS } from '@moolox/tokens';

// ---------------------------------------------------------------------------
// Export Configuration
// ---------------------------------------------------------------------------

/** Configuration options for the Next.js code export. */
export interface NextJSExportOptions {
  /** Project ID for manifest tracking */
  projectId: string;
  /** Version number for manifest tracking */
  versionNum: number;
  /** Project display name (used in package.json and layout metadata) */
  projectName: string;
  /** Project slug (used for package name) */
  projectSlug: string;
  /** Whether to include TypeScript configuration (default: true) */
  includeTypeScript?: boolean;
  /** Base path for exported files (default: '') */
  basePath?: string;
}

// ---------------------------------------------------------------------------
// Core Exporter
// ---------------------------------------------------------------------------

/**
 * Exports a Moolox project AST and design tokens into a complete,
 * standalone Next.js 15 App Router project.
 *
 * The exported code has zero Moolox runtime dependencies and passes
 * `npm install && npm run build` independently.
 *
 * @param astRoot - Root AST node of the project
 * @param tokens - Design token document (W3C format)
 * @param options - Export configuration
 * @returns Code export manifest with all generated files
 */
export function exportToNextJS(
  astRoot: IASTNode,
  tokens: TokenDocument,
  options: NextJSExportOptions,
): ICodeExportManifest {
  const startTime = performance.now();
  const basePath = options.basePath ? `${options.basePath}/` : '';
  const files: Record<string, string> = {};

  // 1. Generate package.json
  files[`${basePath}package.json`] = generatePackageJson(options);

  // 2. Generate tsconfig.json
  if (options.includeTypeScript !== false) {
    files[`${basePath}tsconfig.json`] = generateTsConfig();
  }

  // 3. Generate next.config.js
  files[`${basePath}next.config.js`] = generateNextConfig();

  // 4. Compile design tokens to CSS custom properties
  const tokenCSS = compileTokensToStandaloneCSS(tokens);
  files[`${basePath}src/styles/tokens.css`] = tokenCSS;

  // 5. Generate global stylesheet
  files[`${basePath}src/styles/globals.css`] = generateGlobalCSS();

  // 6. Generate root layout
  files[`${basePath}src/app/layout.tsx`] = generateRootLayout(options.projectName);

  // 7. Generate main page from AST
  const pageComponent = serializeAST(astRoot, {
    exportAsComponent: true,
    componentName: 'HomePage',
    includeNodeIds: false, // Clean export — no data-node-id attributes
    validateSchema: true,
    indentSize: 2,
  });
  files[`${basePath}src/app/page.tsx`] = pageComponent;

  // 8. Generate .gitignore
  files[`${basePath}.gitignore`] = generateGitIgnore();

  // 9. Generate README
  files[`${basePath}README.md`] = generateReadme(options.projectName);

  const generationMs = Math.round(performance.now() - startTime);
  const totalBytes = Object.values(files).reduce((sum, content) => sum + content.length, 0);

  return {
    projectId: options.projectId,
    versionNum: options.versionNum,
    files,
    totalFiles: Object.keys(files).length,
    totalBytes,
    generationMs,
  };
}

// ---------------------------------------------------------------------------
// File Generators
// ---------------------------------------------------------------------------

function generatePackageJson(options: NextJSExportOptions): string {
  const pkg = {
    name: sanitizePackageName(options.projectSlug),
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      next: '^15.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      typescript: '^5.8.0',
      '@types/node': '^22.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
    },
  };

  return JSON.stringify(pkg, null, 2) + '\n';
}

function generateTsConfig(): string {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  return JSON.stringify(config, null, 2) + '\n';
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
}

function compileTokensToStandaloneCSS(tokens: TokenDocument): string {
  // Use the existing token compiler but output standalone CSS custom properties
  const compiledCSS = compileTokenMapToCSS(tokens.tokens || (tokens as any).tokenMap || {}).cssText;

  const header = `/**
 * Design Tokens — CSS Custom Properties
 *
 * Auto-generated from W3C Design Token specification.
 * Do not edit manually; changes will be overwritten on next export.
 */

`;

  return header + compiledCSS;
}

function generateGlobalCSS(): string {
  return `@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}
`;
}

function generateRootLayout(projectName: string): string {
  const escapedName = escapeJSString(projectName);

  return `import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '${escapedName}',
  description: 'Built with Moolox — AI-Powered Digital Experience Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
}

function generateGitIgnore(): string {
  return `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files
.env*.local

# typescript
*.tsbuildinfo
next-env.d.ts
`;
}

function generateReadme(projectName: string): string {
  return `# ${projectName}

This project was exported from [Moolox](https://moolox.com), the AI-powered digital experience platform.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view your site.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Custom Properties (Design Tokens)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Moolox Documentation](https://docs.moolox.com)
`;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Sanitizes a project slug into a valid npm package name. */
function sanitizePackageName(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 214) // npm max package name length
    || 'moolox-project';
}

/** Escapes single quotes for safe use in JS/TS string literals. */
function escapeJSString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\\/g, '\\\\');
}
