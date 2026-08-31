import { config } from "dotenv";
import path from "node:path";
import { validateEnv as validateShared, type Env } from "@rsl/shared-config";

const nodeEnv = process.env.NODE_ENV || "development";
const suffix = nodeEnv === "production" ? "prod" : nodeEnv === "qa" ? "qa" : "dev";
const root = path.resolve(import.meta.dirname, "../../../");
config({ path: path.join(root, "infra/docker", `.env.${suffix}`) });

import fs from "node:fs";

export function validateEnv(): Env {
  const parsed = validateShared();
  const isInsideDocker = Boolean(process.env.DOCKER_CONTAINER) || fs.existsSync("/.dockerenv");
  const isOutsideDocker = !isInsideDocker && process.env.NODE_ENV !== "production";
  if (isOutsideDocker) {
    if (parsed.DATABASE_URL) {
      (parsed as any).DATABASE_URL = parsed.DATABASE_URL
        .replace("@rsldb:5432", "@127.0.0.1:5432")
        .replace("@rsldb", "@127.0.0.1");
    }
    if (parsed.TEST_DATABASE_URL) {
      (parsed as any).TEST_DATABASE_URL = parsed.TEST_DATABASE_URL
        .replace("@rsldb-test:5432", "@127.0.0.1:5434")
        .replace("@rsldb-test", "@127.0.0.1");
    }
    if (parsed.DATABASE_URL_READ_REPLICA) {
      (parsed as any).DATABASE_URL_READ_REPLICA = parsed.DATABASE_URL_READ_REPLICA
        .replace("@rsldb-read:5432", "@127.0.0.1:5436")
        .replace("@rsldb-read", "@127.0.0.1");
    }
    if (parsed.REDIS_URL) {
      (parsed as any).REDIS_URL = parsed.REDIS_URL.replace("redis-dev", "127.0.0.1");
    }
  }
  return parsed;
}

export const env = validateEnv();
export type { Env };
