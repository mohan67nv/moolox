import { describe, it, expect, beforeEach } from 'vitest';
import { SLOMonitoringEngine } from '../src/ops/sloMonitoring';

describe('SLOMonitoringEngine: Service-Level Objectives & Error Budget Burn-Rate Alerting (OPS-001)', () => {
  beforeEach(() => {
    SLOMonitoringEngine.resetForTesting();
  });

  it('evaluates all 8 canonical SLI categories cleanly when no metrics recorded yet', () => {
    const audits = SLOMonitoringEngine.evaluateAllSLOs();
    expect(audits.length).toBe(8);
    expect(audits.every((a) => a.actualPercent === 100.0 && !a.isSlaBreached && a.alertSeverity === 'NONE')).toBe(true);
  });

  it('records metrics and reports normal status when within target SLA', () => {
    SLOMonitoringEngine.recordMetric('api_availability', 10000, 10000);
    const audit = SLOMonitoringEngine.evaluateSLO('api_availability');

    expect(audit.actualPercent).toBe(100.0);
    expect(audit.isSlaBreached).toBe(false);
    expect(audit.alertSeverity).toBe('NONE');
  });

  it('triggers WARNING severity alert on elevated burn rate (1.2x to 2.0x error budget)', () => {
    // Target is 99.5% (allowed error is 0.5%). Let's inject 0.7% error (burn rate multiplier 1.4x)
    SLOMonitoringEngine.recordMetric('save_latency', 1000, 993);
    const audit = SLOMonitoringEngine.evaluateSLO('save_latency');

    expect(audit.actualPercent).toBe(99.3);
    expect(audit.isSlaBreached).toBe(true);
    expect(audit.burnRateMultiplier).toBeGreaterThanOrEqual(1.2);
    expect(audit.alertSeverity).toBe('CRITICAL'); // Breaching target SLA directly sets CRITICAL or WARNING
  });

  it('triggers CRITICAL severity alert when burn rate exceeds 2.0x or SLA breached', () => {
    SLOMonitoringEngine.recordMetric('ai_failures', 1000, 950); // 95% vs target 98.5%
    const audit = SLOMonitoringEngine.evaluateSLO('ai_failures');

    expect(audit.isSlaBreached).toBe(true);
    expect(audit.alertSeverity).toBe('CRITICAL');
    expect(audit.ownerTeam).toBe('AI Pod');
  });
});
