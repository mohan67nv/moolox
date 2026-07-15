/**
 * @moolox/analytics — CRDT Real-Time Sync Latency Tracker (`ANA-004`)
 *
 * Measures WebSocket/Durable Object round-trip synchronization latency,
 * tracks p95/max percentiles, and monitors 60 FPS frame budgets (`<= 16ms`)
 * using distributed OpenTelemetry spans (`OTelTracer`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { OTelTracer } from './OTelTracer';

export interface CRDTLatencyRecord {
  roomId: string;
  opId: string;
  latencyMs: number;
  operationType: string;
  timestamp: number;
  exceededFrameBudget: boolean;
}

export interface CRDTLatencyMetricsSummary {
  roomId: string;
  totalSyncEvents: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  maxLatencyMs: number;
  frameBudgetExceededCount: number;
}

export class CRDTLatencyTracker {
  private static readonly FRAME_BUDGET_MS = 16; // 60 FPS target (`ANA-004`)
  private static recordsByRoom = new Map<string, CRDTLatencyRecord[]>();

  /**
   * Records a CRDT patch sync round-trip duration (`ANA-004`).
   * Emits a distributed OpenTelemetry span for real-time observability.
   */
  static recordSyncLatency(
    roomId: string,
    opId: string,
    latencyMs: number,
    operationType: string
  ): CRDTLatencyRecord {
    const exceeded = latencyMs > this.FRAME_BUDGET_MS;
    const record: CRDTLatencyRecord = {
      roomId,
      opId,
      latencyMs,
      operationType,
      timestamp: Date.now(),
      exceededFrameBudget: exceeded,
    };

    if (!this.recordsByRoom.has(roomId)) {
      this.recordsByRoom.set(roomId, []);
    }
    const roomRecords = this.recordsByRoom.get(roomId)!;
    roomRecords.push(record);

    // Keep history bounded to last 2,000 sync events per room
    if (roomRecords.length > 2000) {
      roomRecords.shift();
    }

    // Emit OTel span (`ANA-001`)
    const span = OTelTracer.startSpan('crdt.sync.patch', {
      'crdt.room_id': roomId,
      'crdt.op_id': opId,
      'crdt.operation_type': operationType,
      'crdt.latency_ms': latencyMs,
      'crdt.frame_budget_exceeded': exceeded,
    });
    // Manually set start/end time so duration matches measured network sync latency
    span.startTime = Date.now() - latencyMs;
    OTelTracer.endSpan(span.spanId, exceeded ? 'error' : 'ok', {
      'crdt.measured_latency_ms': latencyMs,
    });

    return record;
  }

  /**
   * Computes comprehensive latency percentiles and frame budget violation counts (`ANA-004`).
   */
  static getLatencyMetrics(roomId: string): CRDTLatencyMetricsSummary {
    const records = this.recordsByRoom.get(roomId) || [];
    const totalSyncEvents = records.length;

    if (totalSyncEvents === 0) {
      return {
        roomId,
        totalSyncEvents: 0,
        averageLatencyMs: 0,
        p95LatencyMs: 0,
        maxLatencyMs: 0,
        frameBudgetExceededCount: 0,
      };
    }

    const latencies = records.map((r) => r.latencyMs).sort((a, b) => a - b);
    const sum = latencies.reduce((acc, val) => acc + val, 0);
    const averageLatencyMs = Number((sum / totalSyncEvents).toFixed(2));
    const maxLatencyMs = latencies[latencies.length - 1] ?? 0;

    const p95Index = Math.floor(latencies.length * 0.95);
    const p95LatencyMs = latencies[Math.min(p95Index, latencies.length - 1)] ?? 0;

    const frameBudgetExceededCount = records.filter((r) => r.exceededFrameBudget).length;

    return {
      roomId,
      totalSyncEvents,
      averageLatencyMs,
      p95LatencyMs,
      maxLatencyMs,
      frameBudgetExceededCount,
    };
  }

  static getRecentRecords(roomId: string, limit = 50): CRDTLatencyRecord[] {
    const records = this.recordsByRoom.get(roomId) || [];
    return records.slice(-limit);
  }

  static resetForTest(): void {
    this.recordsByRoom.clear();
  }
}
