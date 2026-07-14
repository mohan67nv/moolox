/**
 * @moolox/analytics — OpenTelemetry Tracing Suite (`ANA-001`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OTelTracer } from '../src/index';

describe('OpenTelemetry Tracing Engine (@moolox/analytics)', () => {
  beforeEach(() => {
    OTelTracer.clearBuffer();
  });

  describe('ANA-001: Distributed Span Tracing', () => {
    it('traces async execution blocks and aggregates duration metrics accurately', async () => {
      const res = await OTelTracer.traceLoop('3-Agent-Loop-Execution', async (span) => {
        expect(span.spanId).toMatch(/^spn-/);
        expect(span.traceId).toMatch(/^trc-/);
        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 30));
        return { success: true };
      }, { 'dios.ai.prompt_tokens': 120 });

      expect(res.success).toBe(true);

      const summary = OTelTracer.getMetricsSummary();
      expect(summary.totalSpans).toBe(1);
      expect(summary.errorSpans).toBe(0);
      expect(summary.averageDurationMs).toBeGreaterThanOrEqual(25);
      expect(summary.spansByName['3-Agent-Loop-Execution']).toBeDefined();
    });

    it('records error status and propagates exception when wrapped function throws', async () => {
      await expect(
        OTelTracer.traceLoop('Faulty-Pipeline-Stage', async () => {
          throw new Error('SWC Syntax Parse Crash');
        })
      ).rejects.toThrow('SWC Syntax Parse Crash');

      const summary = OTelTracer.getMetricsSummary();
      expect(summary.totalSpans).toBe(1);
      expect(summary.errorSpans).toBe(1);
    });
  });
});
