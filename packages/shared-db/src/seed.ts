import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, dealerProfiles } from "./schema/index.js";
import { eq } from "drizzle-orm";

const nodeEnv = process.env.NODE_ENV ?? "development";
if (nodeEnv !== "development" && nodeEnv !== "dev" && nodeEnv !== "test") {
  throw new Error("seed:dev must run with NODE_ENV=development or NODE_ENV=test");
}

const connectionString = process.env.DATABASE_URL || "postgresql://rsl_user:password@127.0.0.1:5432/rsldb";
const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function main() {
  // Check if superadmin user already exists
  const existingSuperAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "superadmin@rsl.test"))
    .limit(1);

  if (existingSuperAdmin.length > 0) {
    console.log("[SEED] Super-admin user (superadmin@rsl.test) already exists. Skipping seed execution.");
    await pool.end();
    return;
  }

  // Create super-admin if user does not exist
  const passwordHash = bcrypt.hashSync("Test1234!", 10);
  const [superAdmin] = await db
    .insert(users)
    .values({
      email: "superadmin@rsl.test",
      passwordHash,
      role: "super-admin" as any,
      isEmailVerified: true,
      isActive: true,
    })
    .returning({ id: users.id });

  // Ensure dealerProfile exists for Super Admin
  await db.insert(dealerProfiles).values({
    userId: superAdmin.id,
    displayName: "Super Admin",
  });

  console.log("[SEED] Created super-admin user (superadmin@rsl.test / Test1234!).");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
