import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.TEST_DATABASE_URL ?? "postgresql://rsl_user:password@localhost:5434/rsldb_test",
  },
});
