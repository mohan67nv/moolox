/**
 * @moolox/db — Drizzle ORM Schema & Database Access Layer
 *
 * Feature IDs: DB-001
 *
 * Single source of truth for all database tables, relations, and connection pools.
 * Exported schema definitions and types are consumed across the monorepo.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export * from './schema';
export { getDb, type Database } from './client';
