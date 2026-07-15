import { describe, it, expect, beforeEach } from 'vitest';
import { MarketplaceCatalogRegistry, type MarketplaceItem } from '../src/registry/marketplaceCatalog';
import { WorkspacePluginBindingEngine } from '../src/installation/pluginInstaller';
import { type PluginManifest } from '@moolox/plugins';

describe('MarketplaceCatalogRegistry & PluginInstaller (MKT-001, MKT-002)', () => {
  const pluginManifest: PluginManifest = {
    id: 'com.moolox.seo-pro',
    version: '1.0.0',
    name: 'SEO Pro Kit',
    author: 'Moolox Studio',
    description: 'Audits heading hierarchy and metadata.',
    permissions: ['read:ast'],
    entryPoint: 'dist/index.js',
    hooks: ['onASTInspect'],
    isActive: true,
  };

  const samplePluginItem: MarketplaceItem = {
    id: 'mkt-plugin-001',
    type: 'plugin',
    title: 'SEO Pro Analyzer',
    creator: 'Moolox Studio',
    description: 'Real-time SEO inspection inside Moolox Studio.',
    category: 'SEO Tools',
    version: '1.0.0',
    priceCents: 1500,
    rating: 4.9,
    downloadsCount: 120,
    manifest: pluginManifest,
    verified: true,
    tags: ['seo', 'ast', 'marketing'],
  };

  beforeEach(() => {
    MarketplaceCatalogRegistry.resetForTest();
    WorkspacePluginBindingEngine.resetForTest();
  });

  it('registers and searches marketplace items by category, price, and query term', () => {
    MarketplaceCatalogRegistry.registerItem(samplePluginItem);
    MarketplaceCatalogRegistry.registerItem({
      ...samplePluginItem,
      id: 'mkt-template-002',
      type: 'template',
      title: 'Fintech Landing Page AST Template',
      category: 'UI Components',
      priceCents: 0,
      tags: ['landing', 'fintech'],
    });

    const seoResults = MarketplaceCatalogRegistry.search({ category: 'SEO Tools' });
    expect(seoResults).toHaveLength(1);
    expect(seoResults[0].id).toBe('mkt-plugin-001');

    const freeResults = MarketplaceCatalogRegistry.search({ maxPriceCents: 0 });
    expect(freeResults).toHaveLength(1);
    expect(freeResults[0].id).toBe('mkt-template-002');
  });

  it('installs a verified marketplace plugin into a workspace (`MKT-002`)', async () => {
    MarketplaceCatalogRegistry.registerItem(samplePluginItem);

    const res = await WorkspacePluginBindingEngine.installPlugin('ws-alpha-123', 'mkt-plugin-001', { apiKey: 'secret' });
    expect(res.success).toBe(true);
    expect(res.installation?.workspaceId).toBe('ws-alpha-123');
    expect(res.installation?.pluginId).toBe('com.moolox.seo-pro');

    const installed = WorkspacePluginBindingEngine.getInstalledPlugins('ws-alpha-123');
    expect(installed).toHaveLength(1);
  });

  it('blocks installation of unverified plugins or templates (`MKT-003` enforcement)', async () => {
    MarketplaceCatalogRegistry.registerItem({
      ...samplePluginItem,
      id: 'mkt-unverified-003',
      verified: false,
    });

    const res = await WorkspacePluginBindingEngine.installPlugin('ws-alpha-123', 'mkt-unverified-003');
    expect(res.success).toBe(false);
    expect(res.error).toContain('has not passed the security verification gate');
  });

  it('uninstalls a plugin from a workspace (`MKT-002`)', async () => {
    MarketplaceCatalogRegistry.registerItem(samplePluginItem);
    await WorkspacePluginBindingEngine.installPlugin('ws-alpha-123', 'mkt-plugin-001');

    const removed = WorkspacePluginBindingEngine.uninstallPlugin('ws-alpha-123', 'com.moolox.seo-pro');
    expect(removed).toBe(true);
    expect(WorkspacePluginBindingEngine.getInstalledPlugins('ws-alpha-123')).toHaveLength(0);
  });

  it('seeds default items and retrieves creator profile storefront with download metrics (`MKT-001`, `MKT-002`)', () => {
    MarketplaceCatalogRegistry.seedDefaultItems();
    const profile = MarketplaceCatalogRegistry.getStorefrontByCreator('moolox-core');

    expect(profile).toBeDefined();
    expect(profile?.displayName).toBe('Moolox Official Core Team');
    expect(profile?.totalItems).toBe(2);
    expect(profile?.totalDownloads).toBe(2070); // 1420 + 650

    // Test increment download counter on install
    MarketplaceCatalogRegistry.incrementDownloadCount('item-seo-audit-plugin');
    const updated = MarketplaceCatalogRegistry.getItem('item-seo-audit-plugin');
    expect(updated?.downloadsCount).toBe(1421);
  });

  it('installs and clones an AST template/component directly into target project tree (`WS-006`, `PRJ-006`)', async () => {
    MarketplaceCatalogRegistry.seedDefaultItems();

    const targetRoot: Record<string, any> = {
      nodeId: 'root',
      type: 'Page',
      children: [],
    };

    const res = await WorkspacePluginBindingEngine.installTemplateToProject(
      'ws-demo',
      'prj-landing',
      'item-saas-hero-pro',
      targetRoot
    );

    expect(res.success).toBe(true);
    expect(res.clonedAST?.type).toBe('HeroContainer');
    expect(res.clonedAST?.nodeId).toMatch(/^node-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(targetRoot.children).toHaveLength(1);

    const item = MarketplaceCatalogRegistry.getItem('item-saas-hero-pro');
    expect(item?.downloadsCount).toBe(651); // incremented from 650
  });
});
