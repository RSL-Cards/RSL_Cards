import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";
import { env } from "../config/index.js";

const isTest = process.env.NODE_ENV === "test";
const connectionString = isTest && env.TEST_DATABASE_URL ? env.TEST_DATABASE_URL : env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === "production" || (connectionString && connectionString.includes("rds.amazonaws.com"));

const pool = new pg.Pool({
  connectionString,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

pool.on('connect', (client) => {
  client.query("SET timezone = 'UTC'");
});

import { DefaultLogger, LogWriter } from "drizzle-orm/logger";
import { logger } from "../lib/logger.js";

class DbLogWriter implements LogWriter {
  write(message: string) {
    // Only log actual SQL queries to avoid noise, stripping the generic "Query: " prefix if present
    const cleanMsg = message.replace(/^Query: /, "");
    logger.info(`[DB] ${cleanMsg}`);
  }
}

const dbLogger = new DefaultLogger({ writer: new DbLogWriter() });
export const db = drizzle(pool, { schema, logger: dbLogger });

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
