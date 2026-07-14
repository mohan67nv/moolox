/**
 * @moolox/deploy — Static Exporter, Cloudflare Anycast & Instant Rollback Unit Tests
 *
 * Feature IDs: DEP-001, DEP-002, DEP-003
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { StaticExporter, CloudflareAnycastPublisher, InstantRollbackEngine } from '../src/index';
import { type IASTNode, type IW3CTokenMap } from '@moolox/types';

describe('Edge Deployment Suite (@moolox/deploy)', () => {
  const sampleTokenMap: IW3CTokenMap = {
    color: {
      bg: { primary: { value: '#0a0f1d', type: 'color' } },
      accent: { primary: { value: '#3b82f6', type: 'color' } },
    },
    space: {},
    font: {},
  };

  const sampleTree: IASTNode = {
    nodeId: 'page-root',
    type: 'section',
    props: { className: 'py-16 px-8 bg-[var(--dios-color-bg-primary)]' },
    styles: {},
    children: [
      {
        nodeId: 'header-node',
        type: 'header',
        props: { className: 'flex justify-between items-center mb-12' },
        styles: {},
        children: [
          { nodeId: 'logo-text', type: 'h1', props: { content: 'Dios Digital Experience' }, styles: {} },
          { nodeId: 'cta-btn', type: 'button', props: { content: 'Start Free', className: 'px-4 py-2 bg-[var(--dios-color-accent-primary)] text-white rounded' }, styles: {} },
        ],
      },
      {
        nodeId: 'hero-body',
        type: 'p',
        props: { content: 'High-performance zero-server-dependency static artifact.' },
        styles: {},
      },
    ],
  };

  describe('DEP-001: Static `/out` Chunk Compiler', () => {
    it('assembles standalone zero-server HTML/CSS/JS bundles with FNV/SHA integrity hashes', async () => {
      const exporter = new StaticExporter();
      const bundle = await exporter.exportBundle(sampleTree, sampleTokenMap, {
        title: 'Production Studio Build',
      });

      expect(bundle.bundleId).toMatch(/^bnd-/);
      expect(bundle.html).toContain('<!DOCTYPE html>');
      expect(bundle.html).toContain('<title>Production Studio Build</title>');
      expect(bundle.html).toContain('--dios-color-bg-primary: #0a0f1d;');
      expect(bundle.html).toContain('Dios Digital Experience');
      expect(bundle.hash).toMatch(/^fnv-/);
      expect(bundle.metadata.totalNodes).toBe(5);
      expect(bundle.metadata.compileDurationMs).toBeLessThan(50);
    });
  });

  describe('DEP-002: Cloudflare R2 / Edge KV Anycast Publisher', () => {
    it('publishes static bundles across global POPs with < 500ms target propagation', async () => {
      const exporter = new StaticExporter();
      const bundle = await exporter.exportBundle(sampleTree, sampleTokenMap);

      const publisher = new CloudflareAnycastPublisher();
      const result = await publisher.publishToEdge(bundle, {
        subdomain: 'My-Enterprise-App',
        projectId: 'prj-101',
        versionId: 'ver-202',
      });

      expect(result.success).toBe(true);
      expect(result.propagationMs).toBeLessThan(500);
      expect(result.edgeUrl).toBe('https://my-enterprise-app.dios.app/');
      expect(result.anycastRegions).toContain('IAD (N. Virginia)');
      expect(result.anycastRegions).toContain('NRT (Tokyo)');

      // Verify retrieval from edge storage
      const fetched = await publisher.getEdgePayload('my-enterprise-app');
      expect(fetched?.bundleId).toBe(bundle.bundleId);
    });
  });

  describe('DEP-003: 1-Second Instant Rollback Engine', () => {
    it('performs atomic pointer flipping in < 1,000ms across edge POPs', async () => {
      const rollbackEngine = new InstantRollbackEngine();

      // Register live version
      rollbackEngine.registerActiveVersion('prj-500', 'v2.1.0-release');
      expect(rollbackEngine.getActiveVersion('prj-500')).toBe('v2.1.0-release');

      // Execute instant rollback to previous version
      const result = await rollbackEngine.rollbackVersion({
        projectId: 'prj-500',
        targetVersionId: 'v1.9.0-stable',
        reason: 'Regression detected in v2.1.0 CTA layout',
      });

      expect(result.success).toBe(true);
      expect(result.flipDurationMs).toBeLessThan(1000);
      expect(result.previousVersionId).toBe('v2.1.0-release');
      expect(result.newActiveVersionId).toBe('v1.9.0-stable');
      expect(rollbackEngine.getActiveVersion('prj-500')).toBe('v1.9.0-stable');
    });
  });
});
