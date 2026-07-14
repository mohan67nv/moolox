/**
 * @moolox/db — Database Client & Connection Pool
 *
 * Initializes the Drizzle ORM instance connected to PostgreSQL (`DATABASE_URL`).
 * Supports connection pooling via `postgres` (`postgres-js`) or serverless mode.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/** Global cache for hot-reloading in Next.js development mode */
const globalForDb = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
  drizzleDb: PostgresJsDatabase<typeof schema> | undefined;
};

/**
 * Creates or retrieves the singleton Drizzle ORM client instance.
 * Reads `DATABASE_URL` from the environment.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (globalForDb.drizzleDb) {
    return globalForDb.drizzleDb;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is missing. Cannot initialize @moolox/db client.',
    );
  }

  const client =
    globalForDb.postgresClient ??
    postgres(connectionString, {
      max: process.env.NODE_ENV === 'production' ? 10 : 1,
      prepare: false,
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.postgresClient = client;
  }

  const db = drizzle(client, { schema });
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.drizzleDb = db;
  }

  return db;
}

export type Database = PostgresJsDatabase<typeof schema>;
