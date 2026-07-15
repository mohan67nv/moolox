import { describe, it, expect, beforeEach } from 'vitest';
import { createHmac } from 'node:crypto';
import { GitHubWebhookLedger } from '../src/sync/webhook-ledger';

describe('GitHubWebhookLedger: Durable Delivery Tracking & Idempotency (GIT-007)', () => {
  const secret = 'test-webhook-secret-999';

  function signPayload(payload: string): string {
    return `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
  }

  beforeEach(() => {
    GitHubWebhookLedger.resetForTesting();
  });

  it('verifies valid HMAC signature and marks delivery as processed', () => {
    const payload = JSON.stringify({ ref: 'refs/heads/main', after: 'sha-abc' });
    const sig = signPayload(payload);

    const res = GitHubWebhookLedger.processDelivery('del-101', 'push', sig, payload, secret);
    expect(res.status).toBe('processed');
    expect(res.record.deliveryId).toBe('del-101');
    expect(res.record.status).toBe('processed');
    expect(res.record.processedAt).toBeDefined();
  });

  it('deduplicates duplicate delivery attempts without triggering re-processing', () => {
    const payload = JSON.stringify({ ref: 'refs/heads/main', after: 'sha-abc' });
    const sig = signPayload(payload);

    GitHubWebhookLedger.processDelivery('del-dup', 'push', sig, payload, secret);
    const dupRes = GitHubWebhookLedger.processDelivery('del-dup', 'push', sig, payload, secret);

    expect(dupRes.status).toBe('duplicate');
    expect(dupRes.message).toContain('already processed. Deduplicated safely');
    expect(dupRes.record.status).toBe('duplicate');
  });

  it('throws on invalid HMAC signature and increments retry count', () => {
    const payload = JSON.stringify({ ref: 'refs/heads/main', after: 'sha-abc' });
    const badSig = 'sha256=invalidhexstring00000000000000000000000000000000000000000000000';

    expect(() => {
      GitHubWebhookLedger.processDelivery('del-fail', 'push', badSig, payload, secret);
    }).toThrow(/Webhook signature mismatch/);

    const record = GitHubWebhookLedger.getDelivery('del-fail');
    expect(record?.status).toBe('failed');
    expect(record?.retryCount).toBe(1);
  });

  it('moves failed delivery to Dead Letter Queue (DLQ) upon exceeding max retries', () => {
    const payload = JSON.stringify({ ref: 'refs/heads/main', after: 'sha-abc' });
    const badSig = 'sha256=invalidhexstring00000000000000000000000000000000000000000000000';

    // Attempt 1
    expect(() => GitHubWebhookLedger.processDelivery('del-dlq', 'push', badSig, payload, secret)).toThrow();
    // Attempt 2
    expect(() => GitHubWebhookLedger.processDelivery('del-dlq', 'push', badSig, payload, secret)).toThrow();
    // Attempt 3 (hits max retries)
    const dlqRes = GitHubWebhookLedger.processDelivery('del-dlq', 'push', badSig, payload, secret);

    expect(dlqRes.status).toBe('dlq');
    expect(dlqRes.record.status).toBe('dlq');
    expect(dlqRes.record.retryCount).toBe(3);
    expect(GitHubWebhookLedger.getDLQRecords().length).toBe(1);
    expect(GitHubWebhookLedger.getDLQRecords()[0].deliveryId).toBe('del-dlq');
  });
});
