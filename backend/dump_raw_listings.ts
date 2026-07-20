import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";

const pool = new pg.Pool({
  connectionString: "postgresql://rsl_user:password@localhost:5435/rsldb" // Port 5435 maps to dev rsldb container
});

const db = drizzle(pool);

async function run() {
  try {
    console.log("=== Querying Sold Listings ===");
    const soldRes = await db.execute(sql`
      SELECT platform, platform_item_id, sold_price, sold_at, title, condition, grade_key
      FROM platform_sold_listings
      ORDER BY sold_at DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(soldRes.rows, null, 2));

    console.log("\n=== Querying Active Listings ===");
    const activeRes = await db.execute(sql`
      SELECT platform, platform_item_id, price, title, condition, item_web_url, image_url, grade_key
      FROM platform_active_listings
      ORDER BY last_seen_at DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(activeRes.rows, null, 2));

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await pool.end();
  }
}

run();
