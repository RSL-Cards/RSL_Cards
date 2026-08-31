import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const rawUrl = process.env.DATABASE_URL ?? "";
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
