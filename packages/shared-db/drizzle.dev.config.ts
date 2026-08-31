import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.dev") });
dotenv.config({ path: path.resolve(__dirname, "../../infra/docker/.env.dev") });
dotenv.config();

const rawUrl = process.env.DATABASE_URL ?? "postgresql://rsl_user:password@localhost:5432/rsldb";
const isProdDb = rawUrl.includes("amazonaws.com") || process.env.NODE_ENV === "production";
const url = isProdDb && !rawUrl.includes("sslmode") ? `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}sslmode=require` : rawUrl;

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
    ssl: isProdDb ? { rejectUnauthorized: false } : false,
  },
});
