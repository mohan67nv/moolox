/**
 * @moolox/git — GitHub Webhook HMAC-SHA256 Signature Verification (GIT-004)
 *
 * Verifies incoming GitHub webhook payloads using HMAC-SHA256 signature
 * validation against the configured webhook secret. Prevents request forgery
 * and replay attacks.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Error thrown when webhook signature verification fails.
 */
export class WebhookSignatureError extends Error {
  public readonly status = 401;
  public readonly code = 'WEBHOOK_SIGNATURE_INVALID';

  constructor(message = 'GitHub webhook signature verification failed.') {
    super(message);
    this.name = 'WebhookSignatureError';
  }
}

/**
 * Verifies a GitHub webhook payload's HMAC-SHA256 signature.
 *
 * GitHub sends the signature in the `x-hub-signature-256` header as:
 * `sha256=<hex_digest>`
 *
 * @param payload - Raw request body string
 * @param signature - Value of the `x-hub-signature-256` header
 * @param secret - GitHub webhook secret
 * @returns true if the signature is valid
 * @throws WebhookSignatureError if the signature is invalid or missing
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature) {
    throw new WebhookSignatureError('Missing x-hub-signature-256 header.');
  }

  if (!signature.startsWith('sha256=')) {
    throw new WebhookSignatureError('Invalid signature format: expected "sha256=<hex_digest>".');
  }

  const expectedSignature = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;

  // Timing-safe comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    throw new WebhookSignatureError('Webhook signature mismatch (length).');
  }

  if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
    throw new WebhookSignatureError('Webhook signature mismatch.');
  }

  return true;
}
