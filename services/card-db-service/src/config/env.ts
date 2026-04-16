import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateEnv as validateShared, type Env } from "@rsl/shared-config";

const root = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
config({ path: path.join(root, ".env.dev") });
export function validateEnv(): Env {
  return validateShared();
}

export type { Env };
