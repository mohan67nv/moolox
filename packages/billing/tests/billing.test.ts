/**
 * @moolox/billing — Stripe Webhooks & Free Quota Enforcement Unit Tests (`BIL-001`, `BIL-002`)
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { FreeQuotaGate, StripeWebhookHandler, type StripeWebhookEvent } from '../src/index';

describe('Enterprise Billing & Metered Quotas (@moolox/billing)', () => {
  describe('BIL-002: Free Quota Enforcement (`500 Credits/mo`)', () => {
    it('enforces exact 500 free token quota allowance and blocks overage', async () => {
      const gate = new FreeQuotaGate();
      const wsId = 'ws-free-101';

      // First request consuming 300 credits
      const res1 = await gate.checkAndConsumeCredits(wsId, 300);
      expect(res1.allowed).toBe(true);
      expect(res1.remainingCredits).toBe(200);
      expect(res1.maxCredits).toBe(500);

      // Second request consuming 250 credits (exceeds 200 remaining)
      const res2 = await gate.checkAndConsumeCredits(wsId, 250);
      expect(res2.allowed).toBe(false);
      expect(res2.remainingCredits).toBe(200);
      expect(res2.reason).toContain('Monthly FREE quota exceeded');
    });
  });

  describe('BIL-001: Stripe Webhook & Subscription Lifecycle Handler', () => {
    it('upgrades workspace to PRO tier upon checkout.session.completed', async () => {
      const mockEvent: StripeWebhookEvent = {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_pro_999',
            metadata: {
              workspace_id: 'ws-free-101',
              target_tier: 'pro',
            },
          },
        },
      };

      const result = await StripeWebhookHandler.handleEvent(mockEvent);
      expect(result.processed).toBe(true);
      expect(result.action).toContain('Upgraded workspace');

      const gate = new FreeQuotaGate();
      const updated = gate.getSubscription('ws-free-101');
      expect(updated?.tier).toBe('pro');
      expect(updated?.monthlyCreditsMax).toBe(10000);
    });
  });
});
