import { defineConfig } from "drizzle-kit";

const testDbUrl =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://rsl_user:password@localhost:5434/rsldb_test";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: testDbUrl,
  },
});
