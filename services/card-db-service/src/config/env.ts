import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateEnv as validateShared, type Env } from "@rsl/shared-config";

const nodeEnv = process.env.NODE_ENV || "development";
const suffix = nodeEnv === "production" ? "prod" : nodeEnv === "qa" ? "qa" : "dev";
const root = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
config({ path: path.join(root, "infra/docker", `.env.${suffix}`) });
export function validateEnv(): Env {
  return validateShared();
}

export type { Env };
