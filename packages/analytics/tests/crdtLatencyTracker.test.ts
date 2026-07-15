import { describe, it, expect, beforeEach } from 'vitest';
import {
  CRDTLatencyTracker,
  OTelTracer,
} from '../src';

describe('CRDT Real-Time Sync Latency Tracker (`ANA-004`)', () => {
  beforeEach(() => {
    CRDTLatencyTracker.resetForTest();
    OTelTracer.clearBuffer();
  });

  it('records sync latencies, emits OpenTelemetry spans (`ANA-001`), and tracks frame budgets (`ANA-004`)', () => {
    const rec1 = CRDTLatencyTracker.recordSyncLatency('room-studio-1', 'op-101', 12, 'node:update_props');
    const rec2 = CRDTLatencyTracker.recordSyncLatency('room-studio-1', 'op-102', 28, 'node:insert'); // > 16ms budget

    expect(rec1.exceededFrameBudget).toBe(false);
    expect(rec2.exceededFrameBudget).toBe(true);

    // Verify OpenTelemetry spans emitted (`ANA-001`)
    const spans = OTelTracer.getBuffer();
    expect(spans.length).toBe(2);
    expect(spans[0].name).toBe('crdt.sync.patch');
    expect(spans[0].attributes['crdt.latency_ms']).toBe(12);
    expect(spans[1].status).toBe('error'); // Marked error due to exceeding 16ms budget
  });

  it('computes exact average, max, and p95 latency percentiles (`ANA-004`)', () => {
    const latencies = [8, 10, 12, 14, 15, 16, 18, 20, 22, 45];
    for (let i = 0; i < latencies.length; i++) {
      CRDTLatencyTracker.recordSyncLatency('room-studio-2', `op-${i}`, latencies[i], 'node:update_props');
    }

    const metrics = CRDTLatencyTracker.getLatencyMetrics('room-studio-2');
    expect(metrics.totalSyncEvents).toBe(10);
    expect(metrics.maxLatencyMs).toBe(45);
    expect(metrics.averageLatencyMs).toBe(18); // sum 180 / 10
    expect(metrics.p95LatencyMs).toBe(45);
    expect(metrics.frameBudgetExceededCount).toBe(4); // 18, 20, 22, 45 (> 16ms)
  });

  it('returns empty zero-initialized metrics when no sync events exist (`ANA-004`)', () => {
    const metrics = CRDTLatencyTracker.getLatencyMetrics('room-empty-99');
    expect(metrics.totalSyncEvents).toBe(0);
    expect(metrics.averageLatencyMs).toBe(0);
    expect(metrics.p95LatencyMs).toBe(0);
  });
});
