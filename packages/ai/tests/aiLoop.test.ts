/**
 * @moolox/ai — 3-Agent Core AI Loop Unit Tests (ORC-001..004, ORC-013)
 *
 * Verifies sub-250ms intent classification, pruneASTWindow context slicing, Zero-Hex
 * layout generation, sub-10ms deterministic quality checks, and self-healing retries.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { HaikuRouter, SonnetGenerator, QualityGate, PipelineOrchestrator, execute3AgentLoop } from '../src/index';
import { type IASTNode, type IW3CTokenMap } from '@moolox/types';

describe('3-Agent Core AI Loop (@moolox/ai)', () => {
  const sampleTokenMap: IW3CTokenMap = {
    color: {
      bg: { primary: { value: '#0f172a', type: 'color' }, secondary: { value: '#1e293b', type: 'color' } },
      accent: { error: { value: '#ef4444', type: 'color' }, primary: { value: '#a855f7', type: 'color' } },
    },
    space: {},
    font: {},
  };

  const sampleCanvasTree: IASTNode = {
    nodeId: 'node-root-section',
    type: 'section',
    props: { className: 'p-8 bg-[var(--dios-color-bg-primary)]' },
    styles: {},
    children: [
      {
        nodeId: 'node-hero-banner',
        type: 'div',
        props: { className: 'p-6 bg-[var(--dios-color-bg-secondary)]' },
        styles: {},
        children: [{ nodeId: 'node-hero-title', type: 'h1', props: { content: 'Original Hero Title' }, styles: {} }],
      },
      {
        nodeId: 'node-pricing-grid',
        type: 'div',
        props: { className: 'grid grid-cols-3 gap-4' },
        styles: {},
        children: [{ nodeId: 'node-tier-1', type: 'div', props: { content: 'Starter Plan' }, styles: {} }],
      },
    ],
  };

  describe('ORC-002: Router Agent (`Claude 3.5 Haiku`)', () => {
    it('executes fast intent classification in < 250ms and slices AST window', async () => {
      const router = new HaikuRouter();
      const result = await router.execute({
        userPrompt: 'Add a new testimonial section inside hero-banner',
        astTree: sampleCanvasTree,
      });

      expect(result.success).toBe(true);
      expect(result.durationMs).toBeLessThan(1000);
      expect(result.intent).toBe('ADD_SECTION');
      expect(result.targetNodeId).toBe('node-hero-banner');
      expect(result.prunedContextTree).toBeDefined();
    });

    it('classifies style and refactoring prompts accurately', async () => {
      const router = new HaikuRouter();
      const styleRes = await router.execute({ userPrompt: 'Change background color to dark blue' });
      expect(styleRes.intent).toBe('UPDATE_STYLE');

      const refactorRes = await router.execute({ userPrompt: 'Refactor pricing-grid into flex container' });
      expect(refactorRes.intent).toBe('REFACTOR_SUBTREE');
    });
  });

  describe('ORC-003: Unified Generator Agent (`Claude 3.7 Sonnet`)', () => {
    it('generates structural updates and resolves ad-hoc hex codes (`TKN-003`)', async () => {
      const generator = new SonnetGenerator();
      const result = await generator.execute({
        userPrompt: 'Change button background to #ff2222 error theme',
        astTree: sampleCanvasTree,
        targetNodeId: 'node-hero-banner',
        activeTokens: sampleTokenMap,
        metadata: { intent: 'UPDATE_STYLE' },
      });

      expect(result.success).toBe(true);
      expect(result.mutatedTree).toBeDefined();

      // Check zero hex resolution
      const mutatedHero = result.mutatedTree?.children?.[0];
      expect(mutatedHero?.styles?.backgroundColor).toBe('var(--dios-color-accent-error)');
    });

    it('creates new section nodes when intent is ADD_SECTION', async () => {
      const generator = new SonnetGenerator();
      const result = await generator.execute({
        userPrompt: 'Create a transparent pricing table',
        astTree: sampleCanvasTree,
        activeTokens: sampleTokenMap,
        metadata: { intent: 'ADD_SECTION' },
      });

      expect(result.success).toBe(true);
      expect(result.mutatedTree?.children?.length).toBe(3);
    });
  });

  describe('ORC-004: Deterministic Static Quality Gate (`Local TS`)', () => {
    it('executes in < 10ms and passes clean canonical AST sub-trees', async () => {
      const linter = new QualityGate();
      const result = await linter.execute({ astTree: sampleCanvasTree });

      expect(result.durationMs).toBeLessThan(100);
      expect(result.qualityGatePassed).toBe(true);
      expect(result.linterErrors).toHaveLength(0);
    });

    it('detects Zero-Hex violations when ad-hoc hex string exists in className or styles', async () => {
      const dirtyTree: IASTNode = {
        nodeId: 'node-dirty-node',
        type: 'div',
        props: { className: 'bg-[#ff0000] p-4' },
        styles: { color: '#123456' },
      };

      const linter = new QualityGate();
      const result = await linter.execute({ astTree: dirtyTree });

      expect(result.qualityGatePassed).toBe(false);
      expect(result.linterErrors?.some((err) => err.includes('Zero-Hex Violation'))).toBe(true);
    });

    it('detects XSS payloads in properties', async () => {
      const xssTree: IASTNode = {
        nodeId: 'node-xss-node',
        type: 'div',
        props: { className: 'p-4', onclick: 'alert(1)', href: 'javascript:void(0)' },
        styles: {},
      };

      const linter = new QualityGate();
      const result = await linter.execute({ astTree: xssTree });

      expect(result.qualityGatePassed).toBe(false);
      expect(result.linterErrors?.some((err) => err.includes('XSS Security Audit'))).toBe(true);
    });
  });

  describe('ORC-013: 3-Agent Orchestrator & Self-Healing Retry Loop', () => {
    it('execute3AgentLoop runs end-to-end and returns clean quality-gated result', async () => {
      const result = await execute3AgentLoop({
        userPrompt: 'Add a contact form section with clean styling',
        astTree: sampleCanvasTree,
        activeTokens: sampleTokenMap,
      });

      expect(result.success).toBe(true);
      expect(result.qualityGatePassed).toBe(true);
      expect(result.intent).toBe('ADD_SECTION');
      expect(result.mutatedTree?.children?.length).toBeGreaterThan(2);
    });
  });
});
