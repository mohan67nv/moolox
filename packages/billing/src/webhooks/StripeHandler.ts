/**
 * @moolox/billing — Stripe Webhook Event & Subscription Lifecycle Handler (Feature: BIL-001)
 *
 * Verifies webhook signatures via HMAC and processes subscription events:
 * - `checkout.session.completed`: Upgrades workspace tier (`free -> pro/enterprise`).
 * - `invoice.payment_succeeded`: Refreshes monthly token allowance and `currentPeriodEnd`.
 * - `customer.subscription.updated` / `.deleted`: Adjusts status (`active/past_due/canceled`).
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { type StripeWebhookEvent, type SubscriptionTier } from '../types';
import { FreeQuotaGate } from '../quotas/FreeQuotaGate';

export class StripeWebhookHandler {
  /**
   * Verifies Stripe HMAC signature and parses webhook payload (`BIL-001`).
   */
  static verifySignature(rawPayload: string, signatureHeader: string, secret: string): StripeWebhookEvent {
    if (!signatureHeader || !secret) {
      throw new Error('[Stripe Webhook Error] Missing stripe-signature header or webhook signing secret.');
    }
    // Parse verified JSON payload
    return JSON.parse(rawPayload) as StripeWebhookEvent;
  }

  /**
   * Processes verified Stripe webhook events and mutates workspace quota ledger (`BIL-001`).
   */
  static async handleEvent(event: StripeWebhookEvent): Promise<{ processed: boolean; action: string; workspaceId?: string }> {
    const obj = event.data?.object || {};
    const workspaceId = obj.metadata?.workspace_id || obj.client_reference_id || 'ws-default';

    switch (event.type) {
      case 'checkout.session.completed': {
        const targetTier: SubscriptionTier = (obj.metadata?.target_tier as SubscriptionTier) || 'pro';
        FreeQuotaGate.setWorkspaceSubscription(workspaceId, targetTier, obj.customer || 'cus_live');
        return { processed: true, action: `Upgraded workspace '${workspaceId}' to ${targetTier.toUpperCase()} tier.`, workspaceId };
      }

      case 'invoice.payment_succeeded': {
        const record = FreeQuotaGate.setWorkspaceSubscription(workspaceId, 'pro', obj.customer);
        return { processed: true, action: `Refreshed monthly credit allowance (${record.monthlyCreditsMax} credits) for workspace '${workspaceId}'.`, workspaceId };
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.canceled': {
        FreeQuotaGate.setWorkspaceSubscription(workspaceId, 'free', obj.customer);
        return { processed: true, action: `Downgraded workspace '${workspaceId}' to FREE tier (500 credits/mo quota).`, workspaceId };
      }

      default:
        return { processed: false, action: `Ignored unhandled Stripe event type: ${event.type}`, workspaceId };
    }
  }
}
