/**
 * @moolox/analytics — OpenTelemetry Distributed Tracing Types (`ANA-001`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export interface OTelSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  attributes: Record<string, any>;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: 'ok' | 'error';
}

export interface TraceMetricsSummary {
  totalSpans: number;
  errorSpans: number;
  averageDurationMs: number;
  spansByName: Record<string, { count: number; avgDurationMs: number }>;
}
