/**
 * @moolox/db — Client Unit Tests
 *
 * Validates the Drizzle ORM singleton client wrapper and environment error handling.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb } from '../src/client';

describe('Database Client Pool (getDb)', () => {
  const originalEnv = process.env.DATABASE_URL;

  beforeEach(() => {
    // Reset singleton state if needed or test env handling
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      delete process.env.DATABASE_URL;
    }
  });

  it('throws a clear error when DATABASE_URL is missing from environment', () => {
    expect(() => getDb()).toThrowError(/DATABASE_URL environment variable is missing/);
  });
});
