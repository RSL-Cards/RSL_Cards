import { config } from "dotenv";
import path from "node:path";
import { validateEnv as validateShared, type Env } from "@rsl/shared-config";

const nodeEnv = process.env.NODE_ENV || "development";
const suffix = nodeEnv === "production" ? "prod" : nodeEnv === "qa" ? "qa" : "dev";
const root = path.resolve(import.meta.dirname, "../../../");
config({ path: path.join(root, "infra/docker", `.env.${suffix}`) });

export function validateEnv(): Env {
  const parsed = validateShared();
  if (process.env.NODE_ENV === "test" || process.env.CI || !process.env.DOCKER_CONTAINER) {
    if (parsed.DATABASE_URL && parsed.DATABASE_URL.includes("@rsldb:")) {
      (parsed as any).DATABASE_URL = parsed.DATABASE_URL.replace("@rsldb:", "@127.0.0.1:");
    }
    if (parsed.TEST_DATABASE_URL && parsed.TEST_DATABASE_URL.includes("@rsldb-test:")) {
      (parsed as any).TEST_DATABASE_URL = parsed.TEST_DATABASE_URL.replace("@rsldb-test:", "@127.0.0.1:");
    }
    if (parsed.DATABASE_URL_READ_REPLICA && parsed.DATABASE_URL_READ_REPLICA.includes("@rsldb-read:")) {
      (parsed as any).DATABASE_URL_READ_REPLICA = parsed.DATABASE_URL_READ_REPLICA.replace("@rsldb-read:", "@127.0.0.1:");
    }
    if (parsed.REDIS_URL && parsed.REDIS_URL.includes("redis-dev")) {
      (parsed as any).REDIS_URL = parsed.REDIS_URL.replace("redis-dev", "127.0.0.1");
    }
  }
  return parsed;
}

export const env = validateEnv();
export type { Env };
