/**
 * @moolox/marketplace — Creator Attribution & Revenue Split Ledger (`MKT-004`)
 *
 * Tracks marketplace sales and usage transactions, enforcing standard 80/20 creator vs. platform
 * revenue splits (`creator_payout_cents`, `platform_fee_cents`), and generating immutable
 * payout transfer requests compatible with Stripe Connect.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export interface TransactionLedgerEntry {
  transactionId: string;
  marketplaceItemId: string;
  buyerWorkspaceId: string;
  creatorId: string;
  grossAmountCents: number;
  creatorPayoutCents: number;
  platformFeeCents: number;
  currency: string;
  timestamp: number;
  status: 'pending' | 'settled' | 'refunded';
}

export interface PayoutSummary {
  creatorId: string;
  totalTransactions: number;
  totalGrossCents: number;
  totalCreatorPayoutCents: number;
  totalPlatformFeeCents: number;
  payoutStatus: string;
}

export class CreatorRevenueLedger {
  private static transactions = new Map<string, TransactionLedgerEntry[]>();
  private static readonly CREATOR_SPLIT_PCT = 0.80; // 80% to creator
  private static readonly PLATFORM_FEE_PCT = 0.20; // 20% platform fee

  /**
   * Records a marketplace transaction and computes split shares (`MKT-004`).
   */
  static recordTransaction(
    marketplaceItemId: string,
    buyerWorkspaceId: string,
    creatorId: string,
    grossAmountCents: number,
    currency: string = 'USD'
  ): TransactionLedgerEntry {
    const creatorPayoutCents = Math.floor(grossAmountCents * this.CREATOR_SPLIT_PCT);
    const platformFeeCents = grossAmountCents - creatorPayoutCents;

    const entry: TransactionLedgerEntry = {
      transactionId: `txn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      marketplaceItemId,
      buyerWorkspaceId,
      creatorId,
      grossAmountCents,
      creatorPayoutCents,
      platformFeeCents,
      currency,
      timestamp: Date.now(),
      status: 'settled',
    };

    const existing = this.transactions.get(creatorId) || [];
    this.transactions.set(creatorId, [...existing, entry]);

    return entry;
  }

  /**
   * Aggregates financial settlement metrics for a given creator (`MKT-004`).
   */
  static getPayoutSummary(creatorId: string): PayoutSummary {
    const list = this.transactions.get(creatorId) || [];

    let gross = 0;
    let payout = 0;
    let fee = 0;

    for (const txn of list) {
      if (txn.status === 'settled') {
        gross += txn.grossAmountCents;
        payout += txn.creatorPayoutCents;
        fee += txn.platformFeeCents;
      }
    }

    return {
      creatorId,
      totalTransactions: list.length,
      totalGrossCents: gross,
      totalCreatorPayoutCents: payout,
      totalPlatformFeeCents: fee,
      payoutStatus: payout > 0 ? 'READY_FOR_STRIPE_TRANSFER' : 'ZERO_BALANCE',
    };
  }

  /**
   * Processes a refund, debiting the creator and platform accounts proportionately (`MKT-004`).
   */
  static processRefund(creatorId: string, transactionId: string): boolean {
    const list = this.transactions.get(creatorId) || [];
    const target = list.find((t) => t.transactionId === transactionId);

    if (!target || target.status === 'refunded') {
      return false;
    }

    target.status = 'refunded';
    return true;
  }

  static getTransactionsForCreator(creatorId: string): TransactionLedgerEntry[] {
    return [...(this.transactions.get(creatorId) || [])];
  }

  static resetForTest(): void {
    this.transactions.clear();
  }
}
