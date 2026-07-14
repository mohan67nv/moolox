/**
 * @moolox/billing — Free Quota Gate & Metered AI Credit Engine (Feature: BIL-002)
 *
 * Strictly enforces monthly AI credit allowances:
 * - Free Tier: `500 credits / month` (`BIL-002`)
 * - Pro Tier: `10,000 credits / month`
 * - Enterprise Tier: `100,000 credits / month`
 *
 * Intercepts AI loop executions and blocks consumption if quota is exceeded.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type SubscriptionRecord, type QuotaCheckResult, type SubscriptionTier } from '../types';

export class FreeQuotaGate {
  /** In-memory / DB ledger of active workspace credit balances (`BIL-002`) */
  private static workspaceSubscriptions = new Map<string, SubscriptionRecord>();

  /**
   * Initializes or resets a workspace subscription record with exact credit quotas (`BIL-002`).
   */
  static setWorkspaceSubscription(workspaceId: string, tier: SubscriptionTier = 'free', stripeCustomerId = 'cus_mock'): SubscriptionRecord {
    let monthlyMax = 500; // Exact Free Tier allowance (`BIL-002`)
    if (tier === 'pro') monthlyMax = 10000;
    if (tier === 'enterprise') monthlyMax = 100000;

    const record: SubscriptionRecord = {
      workspaceId,
      stripeCustomerId,
      tier,
      status: 'active',
      monthlyCreditsMax: monthlyMax,
      creditsConsumedThisMonth: 0,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    };

    FreeQuotaGate.workspaceSubscriptions.set(workspaceId, record);
    return record;
  }

  /**
   * Checks credit balance and consumes tokens if allowed (`BIL-002`).
   */
  async checkAndConsumeCredits(workspaceId: string, creditsRequested = 50): Promise<QuotaCheckResult> {
    let sub = FreeQuotaGate.workspaceSubscriptions.get(workspaceId);
    if (!sub) {
      // Auto-initialize free tier for new workspaces
      sub = FreeQuotaGate.setWorkspaceSubscription(workspaceId, 'free');
    }

    if (sub.status !== 'active' && sub.status !== 'trialing') {
      return {
        allowed: false,
        remainingCredits: 0,
        maxCredits: sub.monthlyCreditsMax,
        tier: sub.tier,
        reason: `Workspace subscription status is '${sub.status}'. Please update billing details.`,
      };
    }

    const remaining = sub.monthlyCreditsMax - sub.creditsConsumedThisMonth;

    if (remaining < creditsRequested) {
      return {
        allowed: false,
        remainingCredits: Math.max(0, remaining),
        maxCredits: sub.monthlyCreditsMax,
        tier: sub.tier,
        reason: `Monthly ${sub.tier.toUpperCase()} quota exceeded (${sub.creditsConsumedThisMonth}/${sub.monthlyCreditsMax} credits used). Request requires ${creditsRequested} credits. Upgrade tier to continue using AI Studio.`,
      };
    }

    // Deduct tokens
    sub.creditsConsumedThisMonth += creditsRequested;
    FreeQuotaGate.workspaceSubscriptions.set(workspaceId, sub);

    return {
      allowed: true,
      remainingCredits: sub.monthlyCreditsMax - sub.creditsConsumedThisMonth,
      maxCredits: sub.monthlyCreditsMax,
      tier: sub.tier,
    };
  }

  /**
   * Retrieves active subscription status for a workspace.
   */
  getSubscription(workspaceId: string): SubscriptionRecord | null {
    return FreeQuotaGate.workspaceSubscriptions.get(workspaceId) || null;
  }
}
