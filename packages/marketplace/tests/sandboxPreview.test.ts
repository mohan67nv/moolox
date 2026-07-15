import { describe, it, expect, beforeEach } from 'vitest';
import { SandboxPreviewRunner } from '../src/preview/sandboxPreviewEngine';
import { MarketplaceCatalogRegistry, type MarketplaceItem } from '../src/registry/marketplaceCatalog';
import { type PluginManifest } from '@moolox/plugins';
import { type IASTNode } from '@moolox/types';

describe('SandboxPreviewRunner (MKT-005)', () => {
  const samplePluginManifest: PluginManifest = {
    id: 'com.moolox.preview-plugin',
    version: '1.0.0',
    name: 'Preview Plugin',
    author: 'Moolox',
    description: 'Preview test',
    permissions: ['read:ast'],
    entryPoint: 'dist/index.js',
    hooks: ['onASTInspect'],
    isActive: true,
  };

  const sampleTemplateAST: IASTNode = {
    nodeId: 'node-12345678-abcd-1234-abcd-1234567890ab',
    type: 'HeroSpec',
    props: { title: 'Sandbox Landing' },
    tokens: {},
    children: [],
  };

  beforeEach(() => {
    SandboxPreviewRunner.resetForTest();
    MarketplaceCatalogRegistry.resetForTest();
  });

  it('boots an active preview scratchpad session for a marketplace template (`MKT-005`)', async () => {
    MarketplaceCatalogRegistry.registerItem({
      id: 'mkt-tmpl-prv-1',
      type: 'template',
      title: 'Hero Preview Template',
      creator: 'Creator Alpha',
      description: 'Hero template',
      category: 'UI Components',
      version: '1.0.0',
      priceCents: 0,
      rating: 5.0,
      downloadsCount: 10,
      templateAST: sampleTemplateAST as any,
      verified: true,
      tags: ['hero'],
    });

    const session = await SandboxPreviewRunner.startPreviewSession('mkt-tmpl-prv-1');
    expect(session.status).toBe('active');
    expect(session.simulatedOutputState.previewReady).toBe(true);
    expect(session.auditResult?.verified).toBe(true);
  });

  it('boots an active preview scratchpad session for a marketplace plugin (`MKT-005`)', async () => {
    MarketplaceCatalogRegistry.registerItem({
      id: 'mkt-plg-prv-2',
      type: 'plugin',
      title: 'Preview Plugin Item',
      creator: 'Creator Beta',
      description: 'Plugin preview test',
      category: 'AST Generators',
      version: '1.0.0',
      priceCents: 500,
      rating: 4.8,
      downloadsCount: 5,
      manifest: samplePluginManifest,
      verified: true,
      tags: ['plugin'],
    });

    const session = await SandboxPreviewRunner.startPreviewSession('mkt-plg-prv-2');
    expect(session.status).toBe('active');
    expect(session.simulatedOutputState.manifestValid).toBe(true);
  });

  it('terminates an active session and cleans up ephemeral assets (`MKT-005`)', async () => {
    MarketplaceCatalogRegistry.registerItem({
      id: 'mkt-tmpl-prv-3',
      type: 'template',
      title: 'Cleanup Test Template',
      creator: 'Moolox',
      description: 'Test',
      category: 'UI Components',
      version: '1.0.0',
      priceCents: 0,
      rating: 5.0,
      downloadsCount: 1,
      templateAST: sampleTemplateAST as any,
      verified: true,
      tags: ['test'],
    });

    const session = await SandboxPreviewRunner.startPreviewSession('mkt-tmpl-prv-3');
    const terminated = SandboxPreviewRunner.terminateSession(session.sessionId);
    expect(terminated).toBe(true);
    expect(SandboxPreviewRunner.getActiveSession(session.sessionId)?.status).toBe('terminated');
  });
});
