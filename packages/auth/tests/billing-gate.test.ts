/**
 * @moolox/auth — Billing Gate Unit Tests (Feature: AUTH-003)
 *
 * Validates AI credit circuit breaker behavior and AICreditExceededError.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { AICreditExceededError } from '../src/billing-gate';

describe('Metered AI Credit Billing Gate (AUTH-003)', () => {
  it('AICreditExceededError correctly formats circuit breaker message and status', () => {
    const err = new AICreditExceededError('ws_test_123', 50, 12);
    expect(err.status).toBe(402);
    expect(err.code).toBe('AI_CREDIT_EXCEEDED');
    expect(err.message).toContain('requires 50 credits, but only has 12 credits remaining');
  });

  it('AICreditExceededError is an instance of Error', () => {
    const err = new AICreditExceededError('ws_test_456', 10, 0);
    expect(err instanceof Error).toBe(true);
    expect(err.name).toBe('AICreditExceededError');
  });
});
