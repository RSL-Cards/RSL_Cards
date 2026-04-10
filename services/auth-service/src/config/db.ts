import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pkg from 'pg';
import * as schema from '@rsl/shared-db';
import type { Env } from './env.js';

const { Pool } = pkg;

let pool: pkg.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(env: Env) {
  if (!dbInstance) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
    });
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}

export async function testConnection(env: Env): Promise<{ ok: boolean; error?: unknown }> {
  try {
    const db = getDb(env);
    await db.execute(sql`SELECT 1`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}
