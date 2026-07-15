/**
 * @moolox/deploy — Service-Level Objectives (SLO) & Burn-Rate Alerting Engine (`OPS-001`)
 *
 * Tracks 8 canonical Service-Level Indicators (`SLIs`) across API availability,
 * save latency, Git sync lag, queue delay, deployment success, AI failures,
 * backup freshness, and PITR restore success. Calculates error budget burn rates
 * and issues structured alerts.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export type SLICategory =
  | 'api_availability'
  | 'save_latency'
  | 'git_sync_lag'
  | 'queue_delay'
  | 'deployment_success'
  | 'ai_failures'
  | 'backup_freshness'
  | 'restore_success';

export interface SLITarget {
  category: SLICategory;
  targetPercent: number;
  windowHours: number;
  ownerTeam: string;
}

export interface SLOMetricEntry {
  category: SLICategory;
  totalRequestsOrEvents: number;
  successfulOrWithinTarget: number;
  timestamp: number;
}

export interface SLOBurnAudit {
  category: SLICategory;
  actualPercent: number;
  targetPercent: number;
  errorBudgetRemainingPercent: number;
  burnRateMultiplier: number;
  isSlaBreached: boolean;
  alertSeverity: 'NONE' | 'WARNING' | 'CRITICAL';
  ownerTeam: string;
}

export class SLOMonitoringEngine {
  private static readonly TARGETS: Record<SLICategory, SLITarget> = {
    api_availability: { category: 'api_availability', targetPercent: 99.99, windowHours: 720, ownerTeam: 'Platform Pod' },
    save_latency: { category: 'save_latency', targetPercent: 99.5, windowHours: 720, ownerTeam: 'Canvas Pod' },
    git_sync_lag: { category: 'git_sync_lag', targetPercent: 99.0, windowHours: 720, ownerTeam: 'Git Sync Pod' },
    queue_delay: { category: 'queue_delay', targetPercent: 99.9, windowHours: 720, ownerTeam: 'Infra Pod' },
    deployment_success: { category: 'deployment_success', targetPercent: 99.9, windowHours: 720, ownerTeam: 'Deploy Pod' },
    ai_failures: { category: 'ai_failures', targetPercent: 98.5, windowHours: 720, ownerTeam: 'AI Pod' },
    backup_freshness: { category: 'backup_freshness', targetPercent: 99.99, windowHours: 720, ownerTeam: 'Data Ops Pod' },
    restore_success: { category: 'restore_success', targetPercent: 100.0, windowHours: 720, ownerTeam: 'Data Ops Pod' },
  };

  private static metrics = new Map<SLICategory, SLOMetricEntry[]>();

  /**
   * Records an SLI measurement entry (`OPS-001`).
   */
  static recordMetric(category: SLICategory, total: number, successful: number): void {
    const existing = this.metrics.get(category) || [];
    existing.push({
      category,
      totalRequestsOrEvents: total,
      successfulOrWithinTarget: successful,
      timestamp: Date.now(),
    });
    this.metrics.set(category, existing);
  }

  /**
   * Evaluates SLO conformance and burn rate for a given category (`OPS-001`).
   */
  static evaluateSLO(category: SLICategory): SLOBurnAudit {
    const target = this.TARGETS[category];
    const entries = this.metrics.get(category) || [];

    if (entries.length === 0) {
      return {
        category,
        actualPercent: 100.0,
        targetPercent: target.targetPercent,
        errorBudgetRemainingPercent: 100.0,
        burnRateMultiplier: 1.0,
        isSlaBreached: false,
        alertSeverity: 'NONE',
        ownerTeam: target.ownerTeam,
      };
    }

    const totalReqs = entries.reduce((acc, e) => acc + e.totalRequestsOrEvents, 0);
    const totalSuccess = entries.reduce((acc, e) => acc + e.successfulOrWithinTarget, 0);

    const actualPercent = totalReqs > 0 ? (totalSuccess / totalReqs) * 100 : 100.0;
    const allowedErrorPercent = 100.0 - target.targetPercent;
    const actualErrorPercent = 100.0 - actualPercent;

    const burnRateMultiplier = allowedErrorPercent > 0 ? actualErrorPercent / allowedErrorPercent : actualErrorPercent > 0 ? 10.0 : 0.0;
    const isSlaBreached = actualPercent < target.targetPercent;
    const errorBudgetRemainingPercent = Math.max(0, (1.0 - burnRateMultiplier) * 100);

    let alertSeverity: 'NONE' | 'WARNING' | 'CRITICAL' = 'NONE';
    if (burnRateMultiplier >= 2.0 || isSlaBreached) {
      alertSeverity = 'CRITICAL';
    } else if (burnRateMultiplier >= 1.2) {
      alertSeverity = 'WARNING';
    }

    return {
      category,
      actualPercent: Number(actualPercent.toFixed(4)),
      targetPercent: target.targetPercent,
      errorBudgetRemainingPercent: Number(errorBudgetRemainingPercent.toFixed(2)),
      burnRateMultiplier: Number(burnRateMultiplier.toFixed(2)),
      isSlaBreached,
      alertSeverity,
      ownerTeam: target.ownerTeam,
    };
  }

  /**
   * Evaluates all 8 canonical SLIs (`OPS-001`).
   */
  static evaluateAllSLOs(): SLOBurnAudit[] {
    const categories: SLICategory[] = [
      'api_availability',
      'save_latency',
      'git_sync_lag',
      'queue_delay',
      'deployment_success',
      'ai_failures',
      'backup_freshness',
      'restore_success',
    ];
    return categories.map((c) => this.evaluateSLO(c));
  }

  static resetForTesting(): void {
    this.metrics.clear();
  }
}
