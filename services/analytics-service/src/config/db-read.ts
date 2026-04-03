import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import type { Env } from "./env.js";
import * as schema from "@rsl/shared-db";

const { Pool } = pg;

let readPool: pg.Pool | null = null;
let readDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getReadPool(env: Env): pg.Pool {
  if (!readPool) {
    readPool = new Pool({
      connectionString: env.DATABASE_URL_READ_REPLICA,
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
    });
  }
  return readPool;
}

export function getReadDb(env: Env) {
  if (!readDb) {
    readDb = drizzle(getReadPool(env), { schema });
  }
  return readDb;
}

export async function testReadConnection(env: Env): Promise<{ ok: boolean; error?: string }> {
  try {
    await getReadDb(env).execute(sql`SELECT 1`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function closeReadDb(): Promise<void> {
  if (readPool) {
    await readPool.end();
    readPool = null;
    readDb = null;
  }
}
