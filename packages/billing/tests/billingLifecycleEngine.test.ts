import { describe, it, expect, beforeEach } from 'vitest';
import {
  ProEntitlementGate,
  BillingLifecycleEngine,
} from '../src/lifecycle/billingLifecycleEngine';
import { FreeQuotaGate } from '../src/quotas/FreeQuotaGate';

describe('Pro Entitlement Gate & Canonical Billing Lifecycle Engine (BIL-003, BIL-007)', () => {
  beforeEach(() => {
    BillingLifecycleEngine.resetIdempotencyCache();
  });

  describe('ProEntitlementGate (BIL-003)', () => {
    it('blocks free tier workspaces from accessing Pro features ($29/mo requirement)', () => {
      FreeQuotaGate.setWorkspaceSubscription('ws-free', 'free');
      const result = ProEntitlementGate.checkEntitlement('ws-free', 'custom_domain');

      expect(result.allowed).toBe(false);
      expect(result.currentTier).toBe('free');
      expect(result.requiredTier).toBe('pro');
      expect(result.reason).toContain('requires PRO tier ($29/mo)');
    });

    it('allows pro tier workspaces to access entitled features', () => {
      FreeQuotaGate.setWorkspaceSubscription('ws-pro', 'pro');
      const result = ProEntitlementGate.checkEntitlement('ws-pro', 'custom_domain');

      expect(result.allowed).toBe(true);
      expect(result.currentTier).toBe('pro');
    });
  });

  describe('BillingLifecycleEngine.calculateProration() (BIL-007)', () => {
    it('calculates net charge accurately when upgrading from free to pro mid-cycle (15 days remaining)', () => {
      const quote = BillingLifecycleEngine.calculateProration('free', 'pro', 15, 30);
      // Pro ($29.00 = 2900 cents) / 30 * 15 = 1450 cents charge
      expect(quote.unusedCurrentTierCreditCents).toBe(0);
      expect(quote.newTierChargeCents).toBe(1450);
      expect(quote.netChargeCents).toBe(1450);
    });

    it('calculates net charge when upgrading from pro to enterprise with 10 days remaining', () => {
      const quote = BillingLifecycleEngine.calculateProration('pro', 'enterprise', 10, 30);
      // Pro unused: 2900 / 30 * 10 = ~967 cents
      // Enterprise new: 29900 / 30 * 10 = ~9967 cents
      expect(quote.unusedCurrentTierCreditCents).toBeGreaterThan(950);
      expect(quote.newTierChargeCents).toBeGreaterThan(9900);
      expect(quote.netChargeCents).toBe(quote.newTierChargeCents - quote.unusedCurrentTierCreditCents);
    });
  });

  describe('Idempotent Stripe Webhook Lifecycle Flows (BIL-007)', () => {
    it('handleStripeCheckoutCompleted upgrades workspace and ignores duplicate event IDs', () => {
      const res1 = BillingLifecycleEngine.handleStripeCheckoutCompleted('evt-1', 'ws-test-1', 'pro', 'cus-1');
      expect(res1.processed).toBe(true);
      expect(res1.record?.tier).toBe('pro');

      const res2 = BillingLifecycleEngine.handleStripeCheckoutCompleted('evt-1', 'ws-test-1', 'pro', 'cus-1');
      expect(res2.processed).toBe(false);
      expect(res2.message).toContain('idempotency skip');
    });

    it('handleStripePaymentFailedRetry marks subscription past_due after 3 failed attempts', () => {
      FreeQuotaGate.setWorkspaceSubscription('ws-retry', 'pro');
      BillingLifecycleEngine.handleStripePaymentFailedRetry('evt-retry-1', 'ws-retry', 1);
      BillingLifecycleEngine.handleStripePaymentFailedRetry('evt-retry-2', 'ws-retry', 2);
      const res3 = BillingLifecycleEngine.handleStripePaymentFailedRetry('evt-retry-3', 'ws-retry', 3);

      expect(res3.processed).toBe(true);
      expect(res3.newStatus).toBe('past_due');
    });

    it('handleStripeRefundProcessed downgrades workspace when full monthly fee is refunded', () => {
      FreeQuotaGate.setWorkspaceSubscription('ws-refund', 'pro');
      const res = BillingLifecycleEngine.handleStripeRefundProcessed('evt-ref-1', 'ws-refund', 2900);

      expect(res.processed).toBe(true);
      expect(FreeQuotaGate.prototype.getSubscription('ws-refund')?.tier).toBe('free');
    });
  });

  describe('calculateWorkspaceEconomics() (BIL-007)', () => {
    it('computes unit economics and flags warning status when gross margin drops below 50%', () => {
      FreeQuotaGate.setWorkspaceSubscription('ws-econ', 'pro');
      // Pro revenue = 2900 cents ($29). If user consumes 15,000 AI credits (cost 1500 cents)
      const econ = BillingLifecycleEngine.calculateWorkspaceEconomics('ws-econ', 15000, 10);

      expect(econ.monthlyRevenueCents).toBe(2900);
      expect(econ.aiComputeCostCents).toBe(1500); // 15000 * 0.1
      expect(econ.edgeEgressCostCents).toBe(50); // 10 * 5
      expect(econ.grossMarginCents).toBe(2900 - 1550);
      expect(econ.grossMarginPct).toBeLessThan(50);
      expect(econ.health).toBe('warning');
    });
  });
});
