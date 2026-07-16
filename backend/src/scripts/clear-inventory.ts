import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

async function clearInventory() {
  console.log("Clearing all inventory cards...");
  try {
    await db.execute(sql`TRUNCATE TABLE inventory CASCADE`);
    console.log("✅ Inventory successfully cleared!");
  } catch (error) {
    console.error("❌ Failed to clear inventory:", error);
  }
  process.exit(0);
}

clearInventory();
