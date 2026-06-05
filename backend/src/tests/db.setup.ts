import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

export async function truncateAllTables() {
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
