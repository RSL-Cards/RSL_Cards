import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import type { Env } from "./env.js";
import * as schema from "@rsl/shared-db";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getPool(env: Env): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
    });
  }
  return pool;
}

export function getDb(env: Env) {
  if (!db) {
    db = drizzle(getPool(env), { schema });
  }
  return db;
}

export async function testConnection(env: Env): Promise<{ ok: boolean; error?: string }> {
  try {
    const start = performance.now();
    await getDb(env).execute(sql`SELECT 1`);
    void start;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
