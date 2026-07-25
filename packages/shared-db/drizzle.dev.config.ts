import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.dev") });
dotenv.config({ path: path.resolve(__dirname, "../../infra/docker/.env.dev") });
dotenv.config();

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://rsl_user:password@localhost:5435/rsldb",
  },
});
