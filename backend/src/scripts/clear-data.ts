import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

async function clearData() {
  console.log("Clearing all data except users, dealer_profiles, and system tables...");
  try {
    await db.execute(sql`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (
          SELECT tablename FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename NOT IN ('users', 'dealer_profiles', 'subscription_plans', 'drizzle_migrations')
        ) 
        LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Refresh materialized views that might have been broken
    try {
      await db.execute(sql`REFRESH MATERIALIZED VIEW mv_daily_log_stats`);
    } catch(e) {}
    
    console.log("✅ Data successfully cleared!");
  } catch (error) {
    console.error("❌ Failed to clear data:", error);
  }
  process.exit(0);
}

clearData();
