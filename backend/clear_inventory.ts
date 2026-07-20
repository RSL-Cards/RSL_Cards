import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";

const pool = new pg.Pool({
  connectionString: "postgresql://rsl_user:password@localhost:5435/rsldb"
});

const db = drizzle(pool);

async function run() {
  try {
    console.log("Truncating cards, transactions, and comps cache tables...");
    await db.execute(sql`
      TRUNCATE 
        transactions, 
        listings, 
        inventory, 
        image_hashes, 
        card_variants, 
        cards, 
        players, 
        card_comp_snapshots, 
        platform_sold_listings, 
        platform_active_listings 
      CASCADE;
    `);
    console.log("Database reset completed successfully!");
  } catch (err) {
    console.error("Failed to reset database:", err);
  } finally {
    await pool.end();
  }
}

run();
