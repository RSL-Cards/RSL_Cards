import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";

const pool = new pg.Pool({
  connectionString: "postgresql://rsl_user:password@localhost:5432/rsldb"
});

const db = drizzle(pool);

async function run() {
  try {
    const res = await db.execute(sql`
      SELECT id, added_at 
      FROM inventory 
      ORDER BY added_at DESC 
      LIMIT 1
    `);
    
    if (res.rows.length === 0) {
      console.log("No cards found.");
      process.exit(0);
    }
    
    const card = res.rows[0];
    console.log(`Deleting latest card: ${card.player_name} (ID: ${card.id}) added at ${card.added_at}`);
    
    await db.execute(sql`DELETE FROM transactions WHERE inventory_id = ${card.id}`);
    await db.execute(sql`DELETE FROM inventory WHERE id = ${card.id}`);
    console.log("Deleted successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
