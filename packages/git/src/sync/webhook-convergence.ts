/**
 * @moolox/git — Force-Push Safety Check (`GIT-007`) & Webhook Convergence Engine (`GIT-008`)
 *
 * Prevents non-fast-forward / force-push destructive remote overwrites (`GIT-007`)
 * and converges duplicate, out-of-order, or delayed GitHub webhooks to ensure
 * exact state reconciliation (`GIT-008`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export interface ForcePushSafetyAudit {
  allowed: boolean;
  branch: string;
  isForcePush: boolean;
  reason?: string;
}

export interface WebhookEventRecord {
  deliveryId: string;
  eventType: string;
  repoFullName: string;
  branch: string;
  commitSha: string;
  receivedAt: number;
  status: 'processed' | 'deduplicated' | 'converged' | 'error';
}

export class ForcePushGuard {
  /**
   * Evaluates branch update safety, blocking force-pushes (`+sha` or non-fast-forward flags) on protected branches (`GIT-007`).
   */
  static evaluatePushSafety(branch: string, isForcePush: boolean, isNonFastForward: boolean): ForcePushSafetyAudit {
    const protectedBranches = ['main', 'master', 'production', 'dev', 'staging'];
    const isProtected = protectedBranches.includes(branch.toLowerCase());

    if ((isForcePush || isNonFastForward) && isProtected) {
      return {
        allowed: false,
        branch,
        isForcePush,
        reason: `Force-push or non-fast-forward update on protected branch '${branch}' is strictly forbidden (` + `GIT-007` + `). Rebasing required.`,
      };
    }

    return {
      allowed: true,
      branch,
      isForcePush,
    };
  }
}

export class WebhookConvergenceEngine {
  private static deliveryLedger = new Map<string, WebhookEventRecord>();
  private static branchLatestSha = new Map<string, { commitSha: string; timestamp: number }>();

  /**
   * Processes incoming GitHub webhooks idempotently, deduplicating exact deliveries
   * and converging out-of-order/delayed payloads (`GIT-008`).
   */
  static processWebhookDelivery(
    deliveryId: string,
    eventType: string,
    repoFullName: string,
    branch: string,
    commitSha: string,
    receivedAt = Date.now(),
  ): { status: 'processed' | 'deduplicated' | 'converged'; message: string; record: WebhookEventRecord } {
    // 1. Exact delivery deduplication
    if (this.deliveryLedger.has(deliveryId)) {
      const existing = this.deliveryLedger.get(deliveryId)!;
      return {
        status: 'deduplicated',
        message: `Delivery ${deliveryId} already processed at ${new Date(existing.receivedAt).toISOString()}. Skipping (` + `GIT-008` + `).`,
        record: existing,
      };
    }

    const branchKey = `${repoFullName}:${branch}`;
    const currentLatest = this.branchLatestSha.get(branchKey);

    const record: WebhookEventRecord = {
      deliveryId,
      eventType,
      repoFullName,
      branch,
      commitSha,
      receivedAt,
      status: 'processed',
    };

    // 2. Out-of-order / delayed webhook convergence check
    // If we already received a webhook with a newer timestamp for this branch, we log convergence state
    if (currentLatest && currentLatest.timestamp > receivedAt && currentLatest.commitSha !== commitSha) {
      record.status = 'converged';
      this.deliveryLedger.set(deliveryId, record);

      return {
        status: 'converged',
        message: `Delayed out-of-order webhook delivery (${commitSha} at ${receivedAt}) converged against active HEAD (${currentLatest.commitSha} at ${currentLatest.timestamp}). No stale overwrite permitted (` + `GIT-008` + `).`,
        record,
      };
    }

    // Update branch latest state
    this.branchLatestSha.set(branchKey, { commitSha, timestamp: receivedAt });
    this.deliveryLedger.set(deliveryId, record);

    return {
      status: 'processed',
      message: `Cleanly processed webhook delivery ${deliveryId} for ${branchKey} -> ${commitSha}.`,
      record,
    };
  }

  static getBranchLatestSha(repoFullName: string, branch: string): string | null {
    return this.branchLatestSha.get(`${repoFullName}:${branch}`)?.commitSha || null;
  }

  static resetForTesting(): void {
    this.deliveryLedger.clear();
    this.branchLatestSha.clear();
  }
}
