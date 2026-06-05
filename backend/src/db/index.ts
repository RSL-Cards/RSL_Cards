import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";
import { env } from "../config/index.js";

const isTest = process.env.NODE_ENV === "test";
const connectionString = isTest && env.TEST_DATABASE_URL ? env.TEST_DATABASE_URL : env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
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
