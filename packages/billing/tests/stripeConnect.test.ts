/**
 * @moolox/billing — Stripe Connect Seller Onboarding & 80/20 Payout Tests (`BIL-004`, `MKT-003`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StripeConnectBillingEngine, StripeWebhookHandler, type StripeWebhookEvent } from '../src/index';

describe('Stripe Connect Seller Billing & Payout Splits (`BIL-004`, `MKT-003`)', () => {
  beforeEach(() => {
    StripeConnectBillingEngine.resetForTesting();
  });

  it('creates Stripe Connect Express onboarding account and generates link', () => {
    const account = StripeConnectBillingEngine.createConnectAccount('creator-alice');
    expect(account.creatorId).toBe('creator-alice');
    expect(account.accountType).toBe('express');
    expect(account.payoutsEnabled).toBe(false);
    expect(account.onboardingUrl).toContain('connect.stripe.com/express/onboarding/acct_');
  });

  it('enforces exact 80/20 revenue splits and triggers automated transfer after onboarding', async () => {
    StripeConnectBillingEngine.createConnectAccount('creator-bob');
    StripeConnectBillingEngine.completeOnboarding('creator-bob');

    const result = await StripeConnectBillingEngine.processPurchase(
      'ws-buyer-101',
      'creator-bob',
      'item-pro-hero',
      5000, // $50.00 USD
      'USD'
    );

    expect(result.purchase.grossAmountCents).toBe(5000);
    expect(result.purchase.creatorPayoutCents).toBe(4000); // exactly 80% ($40.00)
    expect(result.purchase.platformFeeCents).toBe(1000);   // exactly 20% ($10.00)
    expect(result.purchase.status).toBe('completed');

    expect(result.transfer).toBeDefined();
    expect(result.transfer?.amountCents).toBe(4000);
    expect(result.transfer?.status).toBe('succeeded');
    expect(result.transfer?.stripeAccountId).toContain('acct_');
  });

  it('handles Stripe Connect webhooks (`account.updated`, `charge.refunded`) via StripeWebhookHandler', async () => {
    StripeConnectBillingEngine.createConnectAccount('creator-carol');

    const accountEvent: StripeWebhookEvent = {
      id: 'evt_acc_101',
      type: 'account.updated',
      data: {
        object: {
          id: 'creator-carol',
          details_submitted: true,
          payouts_enabled: true,
          metadata: {
            creator_id: 'creator-carol',
          },
        },
      },
    };

    const handleRes = await StripeWebhookHandler.handleEvent(accountEvent);
    expect(handleRes.processed).toBe(true);
    expect(handleRes.action).toContain('Stripe Connect onboarding completed');

    const account = StripeConnectBillingEngine.getConnectAccount('creator-carol');
    expect(account?.payoutsEnabled).toBe(true);

    // Make purchase and refund via webhook
    const purRes = await StripeConnectBillingEngine.processPurchase('ws-1', 'creator-carol', 'item-1', 1000);
    expect(purRes.transfer?.status).toBe('succeeded');

    const refundEvent: StripeWebhookEvent = {
      id: 'evt_ref_202',
      type: 'charge.refunded',
      data: {
        object: {
          id: purRes.purchase.purchaseId,
          metadata: {
            purchase_id: purRes.purchase.purchaseId,
          },
        },
      },
    };

    const refundRes = await StripeWebhookHandler.handleEvent(refundEvent);
    expect(refundRes.processed).toBe(true);

    const transfers = StripeConnectBillingEngine.getTransfersForCreator('creator-carol');
    expect(transfers[0].status).toBe('reversed');
  });
});
