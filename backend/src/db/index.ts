import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";
import { env } from "../config/index.js";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
});

export const db = drizzle(pool, { schema });

export async function testDbConnection() {
  try {
    const client = await pool.connect();
    client.release();
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function closeDb() {
  await pool.end();
}
