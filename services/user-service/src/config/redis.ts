import { Redis } from "ioredis";
import type { Env } from "./env.js";

let client: Redis | null = null;

export function getRedis(env: Env): Redis {
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return client;
}

export async function testConnection(env: Env): Promise<{ ok: boolean; error?: string }> {
  try {
    await getRedis(env).ping();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
