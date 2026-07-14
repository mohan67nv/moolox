/**
 * @moolox/billing — Enterprise Billing & Quota Types (`BIL-001`, `BIL-002`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface SubscriptionRecord {
  workspaceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  monthlyCreditsMax: number;
  creditsConsumedThisMonth: number;
  currentPeriodEnd: string;
}

export interface QuotaCheckResult {
  /** Whether the workspace has enough credits remaining for the AI operation */
  allowed: boolean;
  /** Credits remaining in active billing cycle */
  remainingCredits: number;
  /** Total maximum credit budget per cycle */
  maxCredits: number;
  /** Active billing tier */
  tier: SubscriptionTier;
  /** Reason string if request is denied */
  reason?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, any>;
  };
}
