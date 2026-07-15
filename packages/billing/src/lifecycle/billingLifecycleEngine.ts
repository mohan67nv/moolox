/**
 * @moolox/billing — Pro Entitlement Gate & Canonical Billing Lifecycle Engine
 *
 * Feature IDs: BIL-003, BIL-007
 *
 * Manages Pro tier ($29/mo) entitlements, mid-cycle proration math,
 * idempotent Stripe lifecycle events (checkout, invoice, retries, refunds, cancellations),
 * and live gross-margin unit economics calculation per workspace.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { FreeQuotaGate } from '../quotas/FreeQuotaGate';
import { type SubscriptionTier, type SubscriptionRecord } from '../types';

export type EntitledFeature =
  | 'custom_domain'
  | 'git_sync'
  | 'pro_ai_credits'
  | 'team_seats'
  | 'anycast_cdn'
  | 'instant_rollback';

export interface EntitlementCheckResult {
  allowed: boolean;
  feature: EntitledFeature;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  reason?: string;
}

export interface ProrationQuote {
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  remainingDays: number;
  totalCycleDays: number;
  unusedCurrentTierCreditCents: number;
  newTierChargeCents: number;
  netChargeCents: number;
}

export interface WorkspaceEconomics {
  workspaceId: string;
  tier: SubscriptionTier;
  monthlyRevenueCents: number;
  aiComputeCostCents: number;
  edgeEgressCostCents: number;
  totalCostCents: number;
  grossMarginCents: number;
  grossMarginPct: number;
  health: 'healthy' | 'warning' | 'unprofitable';
}

/**
 * Entitlement matrix map assigning minimum tier requirements (`BIL-003`).
 */
const ENTITLEMENT_REQUIREMENTS: Record<EntitledFeature, SubscriptionTier> = {
  custom_domain: 'pro',
  git_sync: 'pro',
  pro_ai_credits: 'pro',
  team_seats: 'pro',
  anycast_cdn: 'pro',
  instant_rollback: 'pro',
};

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

const TIER_PRICES_CENTS_PER_MONTH: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 2900, // $29.00 / month (`BIL-003`)
  enterprise: 29900, // $299.00 / month
};

export class ProEntitlementGate {
  /**
   * Verifies whether a workspace has active entitlement to a protected feature (`BIL-003`).
   */
  static checkEntitlement(workspaceId: string, feature: EntitledFeature): EntitlementCheckResult {
    const sub = FreeQuotaGate.prototype.getSubscription(workspaceId) || {
      workspaceId,
      stripeCustomerId: 'cus_none',
      tier: 'free',
      status: 'active',
      monthlyCreditsMax: 500,
      creditsConsumedThisMonth: 0,
      currentPeriodEnd: new Date().toISOString(),
    };

    const requiredTier = ENTITLEMENT_REQUIREMENTS[feature];
    const userTierLevel = TIER_HIERARCHY[sub.tier];
    const requiredTierLevel = TIER_HIERARCHY[requiredTier];

    if (sub.status !== 'active' && sub.status !== 'trialing') {
      return {
        allowed: false,
        feature,
        currentTier: sub.tier,
        requiredTier,
        reason: `Subscription is currently '${sub.status}'. Please update your billing details to use this feature.`,
      };
    }

    if (userTierLevel < requiredTierLevel) {
      return {
        allowed: false,
        feature,
        currentTier: sub.tier,
        requiredTier,
        reason: `Feature '${feature}' requires ${requiredTier.toUpperCase()} tier ($29/mo). Current tier: ${sub.tier.toUpperCase()}.`,
      };
    }

    return {
      allowed: true,
      feature,
      currentTier: sub.tier,
      requiredTier,
    };
  }
}

export class BillingLifecycleEngine {
  /** Idempotent ledger of processed Stripe event IDs */
  private static processedEvents = new Set<string>();

  /**
   * Calculates exact proration credit/charge when upgrading or downgrading mid-cycle (`BIL-007`).
   */
  static calculateProration(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier,
    remainingDays: number,
    totalCycleDays = 30,
  ): ProrationQuote {
    const safeDays = Math.max(0, Math.min(remainingDays, totalCycleDays));
    const currentPrice = TIER_PRICES_CENTS_PER_MONTH[currentTier];
    const targetPrice = TIER_PRICES_CENTS_PER_MONTH[targetTier];

    const unusedCurrentTierCreditCents = Math.round((currentPrice / totalCycleDays) * safeDays);
    const newTierChargeCents = Math.round((targetPrice / totalCycleDays) * safeDays);
    const netChargeCents = newTierChargeCents - unusedCurrentTierCreditCents;

    return {
      currentTier,
      targetTier,
      remainingDays: safeDays,
      totalCycleDays,
      unusedCurrentTierCreditCents,
      newTierChargeCents,
      netChargeCents,
    };
  }

  /**
   * Idempotent Stripe Checkout Completed flow (`checkout.session.completed`).
   */
  static handleStripeCheckoutCompleted(
    eventId: string,
    workspaceId: string,
    targetTier: SubscriptionTier,
    customerId: string,
  ): { processed: boolean; message: string; record?: SubscriptionRecord } {
    if (this.processedEvents.has(eventId)) {
      return { processed: false, message: `Event ${eventId} already processed (idempotency skip).` };
    }

    const record = FreeQuotaGate.setWorkspaceSubscription(workspaceId, targetTier, customerId);
    this.processedEvents.add(eventId);

    return {
      processed: true,
      message: `Successfully upgraded workspace ${workspaceId} to ${targetTier.toUpperCase()} tier via Checkout session ${eventId}.`,
      record,
    };
  }

  /**
   * Idempotent Stripe Invoice Payment Succeeded flow (`invoice.payment_succeeded`).
   */
  static handleStripeInvoiceSucceeded(
    eventId: string,
    workspaceId: string,
    tier: SubscriptionTier,
    customerId: string,
  ): { processed: boolean; message: string; record?: SubscriptionRecord } {
    if (this.processedEvents.has(eventId)) {
      return { processed: false, message: `Event ${eventId} already processed (idempotency skip).` };
    }

    const record = FreeQuotaGate.setWorkspaceSubscription(workspaceId, tier, customerId);
    this.processedEvents.add(eventId);

    return {
      processed: true,
      message: `Invoice payment succeeded. Quota allowance refreshed for ${workspaceId}.`,
      record,
    };
  }

  /**
   * Idempotent Stripe Payment Failed Retry flow (`invoice.payment_failed`).
   */
  static handleStripePaymentFailedRetry(
    eventId: string,
    workspaceId: string,
    attemptCount: number,
  ): { processed: boolean; newStatus: string; message: string } {
    if (this.processedEvents.has(eventId)) {
      return { processed: false, newStatus: 'ignored', message: `Event ${eventId} already processed.` };
    }

    const sub = FreeQuotaGate.prototype.getSubscription(workspaceId);
    if (sub) {
      // If payment fails more than 3 times, mark past_due/suspended
      if (attemptCount >= 3) {
        sub.status = 'past_due';
      }
    }

    this.processedEvents.add(eventId);
    return {
      processed: true,
      newStatus: sub?.status || 'past_due',
      message: `Processed payment failure attempt #${attemptCount} for workspace ${workspaceId}. Status is now ${sub?.status || 'past_due'}.`,
    };
  }

  /**
   * Idempotent Stripe Subscription Canceled flow (`customer.subscription.deleted`).
   */
  static handleStripeSubscriptionCanceled(
    eventId: string,
    workspaceId: string,
  ): { processed: boolean; message: string } {
    if (this.processedEvents.has(eventId)) {
      return { processed: false, message: `Event ${eventId} already processed.` };
    }

    FreeQuotaGate.setWorkspaceSubscription(workspaceId, 'free');
    this.processedEvents.add(eventId);

    return {
      processed: true,
      message: `Subscription canceled. Workspace ${workspaceId} downgraded to FREE tier.`,
    };
  }

  /**
   * Idempotent Stripe Refund Processed flow (`charge.refunded`).
   */
  static handleStripeRefundProcessed(
    eventId: string,
    workspaceId: string,
    refundAmountCents: number,
  ): { processed: boolean; message: string } {
    if (this.processedEvents.has(eventId)) {
      return { processed: false, message: `Event ${eventId} already processed.` };
    }

    // Downgrade if full monthly fee was refunded
    if (refundAmountCents >= 2900) {
      FreeQuotaGate.setWorkspaceSubscription(workspaceId, 'free');
    }

    this.processedEvents.add(eventId);
    return {
      processed: true,
      message: `Refund of $${(refundAmountCents / 100).toFixed(2)} processed for workspace ${workspaceId}.`,
    };
  }

  /**
   * Computes unit economics and gross-margin health for a workspace (`BIL-007`).
   */
  static calculateWorkspaceEconomics(
    workspaceId: string,
    aiCreditsUsedOverride?: number,
    edgeGBsUsedOverride?: number,
  ): WorkspaceEconomics {
    const sub = FreeQuotaGate.prototype.getSubscription(workspaceId) || {
      workspaceId,
      tier: 'free' as SubscriptionTier,
      creditsConsumedThisMonth: 100,
    };

    const monthlyRevenueCents = TIER_PRICES_CENTS_PER_MONTH[sub.tier];
    const creditsUsed = aiCreditsUsedOverride !== undefined ? aiCreditsUsedOverride : (sub as any).creditsConsumedThisMonth || 0;
    const edgeGBs = edgeGBsUsedOverride !== undefined ? edgeGBsUsedOverride : sub.tier === 'free' ? 1 : 15;

    // AI Compute cost estimation: ~$0.001 per credit (~10 cents per 100 credits)
    const aiComputeCostCents = Math.round(creditsUsed * 0.1);
    // Edge egress cost estimation: ~$0.05 per GB (~5 cents per GB)
    const edgeEgressCostCents = Math.round(edgeGBs * 5);
    const totalCostCents = aiComputeCostCents + edgeEgressCostCents;

    const grossMarginCents = monthlyRevenueCents - totalCostCents;
    let grossMarginPct = monthlyRevenueCents > 0 ? Math.round((grossMarginCents / monthlyRevenueCents) * 100) : totalCostCents > 0 ? -100 : 0;

    let health: 'healthy' | 'warning' | 'unprofitable' = 'healthy';
    if (grossMarginPct < 0) {
      health = 'unprofitable';
    } else if (grossMarginPct < 50 && sub.tier !== 'free') {
      health = 'warning';
    }

    return {
      workspaceId,
      tier: sub.tier,
      monthlyRevenueCents,
      aiComputeCostCents,
      edgeEgressCostCents,
      totalCostCents,
      grossMarginCents,
      grossMarginPct,
      health,
    };
  }

  /** Clears idempotency cache for testing */
  static resetIdempotencyCache(): void {
    this.processedEvents.clear();
  }
}
