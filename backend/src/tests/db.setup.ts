import { db, runMigrations } from "../db/index.js";
import { sql } from "drizzle-orm";

let migrationsRan = false;

export async function truncateAllTables() {
  if (!migrationsRan) {
    await runMigrations();
    migrationsRan = true;
  }

  // Disable foreign key checks, truncate all, enable checks
  await db.execute(sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
}
