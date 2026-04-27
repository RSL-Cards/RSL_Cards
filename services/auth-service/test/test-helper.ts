import { createApp } from "../src/app.js";
import { validateEnv } from "../src/config/env.js";
import { getDb, closeDb } from "../src/config/db.js";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import * as schema from "@rsl/shared-db";

const { Client } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initTestApp() {
  let env: ReturnType<typeof validateEnv>;
  try {
    env = validateEnv();
  } catch {
    return null;
  }

  // 1. Ensure test database exists (skip if unreachable — e.g. running outside Docker)
  const dbReady = await ensureTestDbExists(env.TEST_DATABASE_URL!);
  if (!dbReady) return null;

  // 2. Override DATABASE_URL for the app
  const testEnv = { ...env, DATABASE_URL: env.TEST_DATABASE_URL };

  // 3. Initialize App
  const app = await createApp(testEnv as any);

  // 4. Run Migrations
  const db = getDb(testEnv as any);
  await migrate(db, {
    migrationsFolder: path.resolve(
      __dirname,
      "../../../packages/shared-db/drizzle",
    ),
  });

  return app;
}

async function ensureTestDbExists(connectionString: string) {
  const url = new URL(connectionString);
  const dbName = url.pathname.slice(1);

  // Connect to 'postgres' default database to create the test database
  url.pathname = "/postgres";
  const client = new Client({ connectionString: url.toString() });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
    }
    return true;
  } catch (error) {
    console.error("Failed to ensure test database exists:", error);
    return false;
  } finally {
    await client.end();
  }
}

export async function resetDb() {
  const env = validateEnv();
  const testEnv = { ...env, DATABASE_URL: env.TEST_DATABASE_URL };
  const db = getDb(testEnv as any);

  // 1. Get all table names in the public schema (except migrations)
  const result = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name != '__drizzle_migrations'
  `);

  const tables = result.rows.map((row: any) => row.table_name);
  // console.log("DEBUG: Truncating tables:", tables);

  // 2. Truncate all tables
  if (tables.length > 0) {
    const truncateQuery = sql.raw(
      `TRUNCATE TABLE ${tables.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`,
    );
    await db.execute(truncateQuery);
  } else {
    // console.log("DEBUG: No tables found to truncate.");
  }
}

export async function shutdownTestApp() {
  await closeDb();
}
