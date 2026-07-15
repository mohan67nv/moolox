import { describe, it, expect, beforeEach } from 'vitest';
import { CreatorRevenueLedger } from '../src/monetization/creatorLedger';

describe('CreatorRevenueLedger (MKT-004)', () => {
  beforeEach(() => {
    CreatorRevenueLedger.resetForTest();
  });

  it('computes exact 80/20 creator vs platform fee revenue splits', () => {
    const txn = CreatorRevenueLedger.recordTransaction(
      'mkt-plugin-001',
      'ws-buyer-101',
      'creator-acct-555',
      10000 // $100.00
    );

    expect(txn.grossAmountCents).toBe(10000);
    expect(txn.creatorPayoutCents).toBe(8000); // 80%
    expect(txn.platformFeeCents).toBe(2000); // 20%
    expect(txn.status).toBe('settled');
  });

  it('aggregates total payout balances across multiple transactions', () => {
    CreatorRevenueLedger.recordTransaction('mkt-item-1', 'ws-1', 'creator-x', 5000);
    CreatorRevenueLedger.recordTransaction('mkt-item-2', 'ws-2', 'creator-x', 3000);

    const summary = CreatorRevenueLedger.getPayoutSummary('creator-x');
    expect(summary.totalTransactions).toBe(2);
    expect(summary.totalGrossCents).toBe(8000);
    expect(summary.totalCreatorPayoutCents).toBe(6400); // 80% of 8000
    expect(summary.totalPlatformFeeCents).toBe(1600); // 20% of 8000
    expect(summary.payoutStatus).toBe('READY_FOR_STRIPE_TRANSFER');
  });

  it('handles transaction refunds accurately', () => {
    const txn = CreatorRevenueLedger.recordTransaction('mkt-item-1', 'ws-1', 'creator-y', 2000);
    const refunded = CreatorRevenueLedger.processRefund('creator-y', txn.transactionId);

    expect(refunded).toBe(true);
    const summary = CreatorRevenueLedger.getPayoutSummary('creator-y');
    expect(summary.totalGrossCents).toBe(0); // settled only
    expect(summary.payoutStatus).toBe('ZERO_BALANCE');
  });
});
