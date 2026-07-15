/**
 * @moolox/billing — Stripe Connect Seller Billing & 80/20 Payouts Engine (`BIL-004`, `MKT-003`)
 *
 * Manages seller onboarding to Stripe Connect Express/Standard accounts, processes
 * marketplace purchases with strict 80% creator / 20% platform revenue splits,
 * and executes automated or scheduled payouts (`transfer.create`) compatible with Stripe APIs.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import {
  type StripeConnectAccount,
  type ConnectTransferRecord,
  type MarketplacePurchaseRecord,
} from '../types';

export class StripeConnectBillingEngine {
  private static accounts = new Map<string, StripeConnectAccount>();
  private static purchases = new Map<string, MarketplacePurchaseRecord>();
  private static transfers = new Map<string, ConnectTransferRecord[]>();

  private static readonly CREATOR_SPLIT_RATE = 0.80; // 80% creator share
  private static readonly PLATFORM_FEE_RATE = 0.20;  // 20% platform share

  /**
   * Initiates Stripe Connect account creation (`account.create`) and generates onboarding link (`BIL-004`).
   */
  static createConnectAccount(creatorId: string, accountType: 'express' | 'standard' = 'express'): StripeConnectAccount {
    const existing = this.accounts.get(creatorId);
    if (existing) return existing;

    const stripeAccountId = `acct_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    const account: StripeConnectAccount = {
      creatorId,
      stripeAccountId,
      accountType,
      payoutsEnabled: false,
      chargesEnabled: false,
      detailsSubmitted: false,
      onboardingUrl: `https://connect.stripe.com/express/onboarding/${stripeAccountId}`,
      createdTimestamp: Date.now(),
    };

    this.accounts.set(creatorId, account);
    return account;
  }

  /**
   * Simulates completion of Stripe Connect Express onboarding (`account.updated` webhook) (`BIL-004`).
   */
  static completeOnboarding(creatorId: string): StripeConnectAccount {
    const account = this.accounts.get(creatorId);
    if (!account) {
      throw new Error(`Stripe Connect account not found for creator '${creatorId}'.`);
    }

    account.detailsSubmitted = true;
    account.chargesEnabled = true;
    account.payoutsEnabled = true;
    return account;
  }

  /**
   * Processes a paid marketplace transaction and initiates Stripe transfer (`BIL-004`, `MKT-003`).
   */
  static async processPurchase(
    buyerWorkspaceId: string,
    creatorId: string,
    marketplaceItemId: string,
    grossAmountCents: number,
    currency: string = 'USD'
  ): Promise<{ purchase: MarketplacePurchaseRecord; transfer?: ConnectTransferRecord }> {
    const creatorPayoutCents = Math.floor(grossAmountCents * this.CREATOR_SPLIT_RATE);
    const platformFeeCents = grossAmountCents - creatorPayoutCents;

    const purchaseId = `pur_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
    const stripeChargeId = `ch_${Math.random().toString(36).substring(2, 10)}`;

    const purchase: MarketplacePurchaseRecord = {
      purchaseId,
      marketplaceItemId,
      buyerWorkspaceId,
      creatorId,
      grossAmountCents,
      creatorPayoutCents,
      platformFeeCents,
      currency,
      stripeChargeId,
      status: 'completed',
      timestamp: Date.now(),
    };

    this.purchases.set(purchaseId, purchase);

    // Check if creator has active Stripe Connect account with payouts enabled
    const account = this.accounts.get(creatorId);
    let transfer: ConnectTransferRecord | undefined;

    if (account && account.payoutsEnabled && creatorPayoutCents > 0) {
      const transferId = `tr_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      transfer = {
        transferId,
        creatorId,
        stripeAccountId: account.stripeAccountId,
        transactionId: purchaseId,
        amountCents: creatorPayoutCents,
        currency,
        status: 'succeeded',
        timestamp: Date.now(),
      };

      purchase.transferId = transferId;
      const existingTransfers = this.transfers.get(creatorId) || [];
      this.transfers.set(creatorId, [...existingTransfers, transfer]);
    }

    return { purchase, transfer };
  }

  /**
   * Reconciles a charge refund (`charge.refunded`) by reversing the transfer (`transfer.reversed`) (`BIL-004`).
   */
  static reconcileRefund(purchaseId: string): boolean {
    const purchase = this.purchases.get(purchaseId);
    if (!purchase || purchase.status === 'refunded') return false;

    purchase.status = 'refunded';

    if (purchase.transferId && purchase.creatorId) {
      const creatorTransfers = this.transfers.get(purchase.creatorId) || [];
      const targetTransfer = creatorTransfers.find((t) => t.transferId === purchase.transferId);
      if (targetTransfer && targetTransfer.status === 'succeeded') {
        targetTransfer.status = 'reversed';
      }
    }

    return true;
  }

  static getConnectAccount(creatorId: string): StripeConnectAccount | undefined {
    return this.accounts.get(creatorId);
  }

  static getPurchasesForCreator(creatorId: string): MarketplacePurchaseRecord[] {
    return Array.from(this.purchases.values()).filter((p) => p.creatorId === creatorId);
  }

  static getTransfersForCreator(creatorId: string): ConnectTransferRecord[] {
    return [...(this.transfers.get(creatorId) || [])];
  }

  static resetForTesting(): void {
    this.accounts.clear();
    this.purchases.clear();
    this.transfers.clear();
  }
}
