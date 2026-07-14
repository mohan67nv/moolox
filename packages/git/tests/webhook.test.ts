/**
 * @moolox/git — Webhook Verification & Pull Handler Tests (GIT-004)
 */

import { describe, it, expect } from 'vitest';
import { verifyWebhookSignature, WebhookSignatureError } from '../src/sync/webhook-verify';
import { GitHubPushPayloadSchema } from '@moolox/types';
import { createHmac } from 'node:crypto';

describe('Webhook HMAC Signature Verification (GIT-004)', () => {
  const secret = 'test_webhook_secret_12345';
  const payload = JSON.stringify({ ref: 'refs/heads/main', commits: [] });

  function generateValidSignature(body: string, sec: string): string {
    return `sha256=${createHmac('sha256', sec).update(body).digest('hex')}`;
  }

  it('validates genuine HMAC-SHA256 signature against secret', () => {
    const validSignature = generateValidSignature(payload, secret);
    expect(verifyWebhookSignature(payload, validSignature, secret)).toBe(true);
  });

  it('throws WebhookSignatureError when signature is missing', () => {
    expect(() => verifyWebhookSignature(payload, '', secret)).toThrow(WebhookSignatureError);
  });

  it('throws WebhookSignatureError when signature has wrong prefix format', () => {
    const rawHash = createHmac('sha256', secret).update(payload).digest('hex');
    expect(() => verifyWebhookSignature(payload, rawHash, secret)).toThrow(WebhookSignatureError);
  });

  it('throws WebhookSignatureError when secret does not match', () => {
    const invalidSignature = generateValidSignature(payload, 'wrong_secret');
    expect(() => verifyWebhookSignature(payload, invalidSignature, secret)).toThrow(WebhookSignatureError);
  });

  it('throws WebhookSignatureError when payload content is tampered', () => {
    const validSignature = generateValidSignature(payload, secret);
    const tamperedPayload = payload + ' ';
    expect(() => verifyWebhookSignature(tamperedPayload, validSignature, secret)).toThrow(WebhookSignatureError);
  });
});

describe('GitHubPushPayloadSchema Validation (GIT-004)', () => {
  const samplePayload = {
    ref: 'refs/heads/main',
    before: 'abc1234',
    after: 'def5678',
    repository: {
      id: 12345,
      full_name: 'moolox/example-website',
      default_branch: 'main',
    },
    pusher: {
      name: 'johndoe',
      email: 'john@moolox.com',
    },
    commits: [
      {
        id: 'def5678',
        message: 'Update hero section title',
        added: ['src/app/page.tsx'],
        removed: [],
        modified: [],
      },
    ],
    installation: {
      id: 998877,
    },
  };

  it('parses valid push webhook payload correctly', () => {
    const parsed = GitHubPushPayloadSchema.parse(samplePayload);
    expect(parsed.ref).toBe('refs/heads/main');
    expect(parsed.repository.full_name).toBe('moolox/example-website');
    expect(parsed.commits).toHaveLength(1);
    expect(parsed.commits[0]!.message).toBe('Update hero section title');
  });

  it('rejects invalid push payload missing ref or commits', () => {
    expect(() =>
      GitHubPushPayloadSchema.parse({
        repository: { id: 1, full_name: 'foo/bar', default_branch: 'main' },
      }),
    ).toThrow();
  });
});
