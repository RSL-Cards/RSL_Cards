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
  const passwordHash = bcrypt.hashSync("Test1234!", 10);

  // Check if superadmin user already exists
  const existingSuperAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "superadmin@rsl.test"))
    .limit(1);

  let superAdminId: string;

  if (existingSuperAdmin.length > 0) {
    superAdminId = existingSuperAdmin[0].id;
    await db
      .update(users)
      .set({
        passwordHash,
        role: "super-admin" as any,
        isEmailVerified: true,
        isActive: true,
      })
      .where(eq(users.id, superAdminId));
    console.log("[SEED] Updated existing super-admin user (superadmin@rsl.test / Test1234!).");
  } else {
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

    superAdminId = superAdmin.id;
    console.log("[SEED] Created new super-admin user (superadmin@rsl.test / Test1234!).");
  }

  // Ensure dealerProfile exists for Super Admin
  const existingProfile = await db
    .select({ id: dealerProfiles.id })
    .from(dealerProfiles)
    .where(eq(dealerProfiles.userId, superAdminId))
    .limit(1);

  if (existingProfile.length === 0) {
    await db.insert(dealerProfiles).values({
      userId: superAdminId,
      displayName: "Super Admin",
    });
  }

  console.log("[SEED] Super-Admin credentials ready (superadmin@rsl.test / Test1234!).");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
