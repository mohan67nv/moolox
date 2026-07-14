/**
 * @moolox/analytics — OpenTelemetry Distributed Tracing Engine (Feature: ANA-001)
 *
 * Provides structured, distributed span tracking for multi-agent loops
 * (`Haiku -> Sonnet -> Linter`) and edge execution paths with exact latency auditing.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type OTelSpan, type TraceMetricsSummary } from '../types';

export class OTelTracer {
  private static activeSpans = new Map<string, OTelSpan>();
  private static spanBuffer: OTelSpan[] = [];

  /**
   * Starts a new distributed trace span (`ANA-001`).
   */
  static startSpan(name: string, attributes: Record<string, any> = {}, parentSpanId?: string, traceIdOverride?: string): OTelSpan {
    const spanId = `spn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const traceId = traceIdOverride || (parentSpanId ? OTelTracer.activeSpans.get(parentSpanId)?.traceId : `trc-${Date.now().toString(36)}`) || `trc-${Date.now().toString(36)}`;

    const span: OTelSpan = {
      spanId,
      traceId,
      parentSpanId,
      name,
      attributes: { ...attributes, 'dios.timestamp': Date.now() },
      startTime: Date.now(),
      status: 'ok',
    };

    OTelTracer.activeSpans.set(spanId, span);
    return span;
  }

  /**
   * Ends an active trace span, measuring exact `durationMs` (`ANA-001`).
   */
  static endSpan(spanId: string, status: 'ok' | 'error' = 'ok', additionalAttributes: Record<string, any> = {}): OTelSpan | null {
    const span = OTelTracer.activeSpans.get(spanId);
    if (!span) return null;

    const endTime = Date.now();
    span.endTime = endTime;
    span.durationMs = endTime - span.startTime;
    span.status = status;
    span.attributes = { ...span.attributes, ...additionalAttributes };

    OTelTracer.activeSpans.delete(spanId);
    OTelTracer.spanBuffer.push(span);

    // Keep memory trace buffer bounded to last 1,000 spans
    if (OTelTracer.spanBuffer.length > 1000) {
      OTelTracer.spanBuffer.shift();
    }

    return span;
  }

  /**
   * Wraps an async execution block inside a monitored OTel span (`ANA-001`).
   */
  static async traceLoop<T>(name: string, fn: (span: OTelSpan) => Promise<T>, attributes: Record<string, any> = {}, parentSpanId?: string): Promise<T> {
    const span = OTelTracer.startSpan(name, attributes, parentSpanId);
    try {
      const result = await fn(span);
      OTelTracer.endSpan(span.spanId, 'ok');
      return result;
    } catch (err: any) {
      OTelTracer.endSpan(span.spanId, 'error', { 'error.message': err?.message || 'Execution exception' });
      throw err;
    }
  }

  /**
   * Returns buffered spans and aggregate latency metrics (`ANA-001`).
   */
  static getMetricsSummary(): TraceMetricsSummary {
    const totalSpans = OTelTracer.spanBuffer.length;
    let totalDuration = 0;
    let errorSpans = 0;
    const byName: Record<string, { totalDuration: number; count: number }> = {};

    for (const span of OTelTracer.spanBuffer) {
      const dur = span.durationMs || 0;
      totalDuration += dur;
      if (span.status === 'error') errorSpans++;

      if (!byName[span.name]) byName[span.name] = { totalDuration: 0, count: 0 };
      byName[span.name].totalDuration += dur;
      byName[span.name].count += 1;
    }

    const spansByName: Record<string, { count: number; avgDurationMs: number }> = {};
    for (const [name, stats] of Object.entries(byName)) {
      spansByName[name] = {
        count: stats.count,
        avgDurationMs: stats.count > 0 ? Math.round(stats.totalDuration / stats.count) : 0,
      };
    }

    return {
      totalSpans,
      errorSpans,
      averageDurationMs: totalSpans > 0 ? Math.round(totalDuration / totalSpans) : 0,
      spansByName,
    };
  }

  static getBuffer(): OTelSpan[] {
    return [...OTelTracer.spanBuffer];
  }

  static clearBuffer(): void {
    OTelTracer.spanBuffer = [];
    OTelTracer.activeSpans.clear();
  }
}
