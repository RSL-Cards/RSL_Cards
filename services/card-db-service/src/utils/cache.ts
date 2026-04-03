import type { Redis } from "ioredis";

export const cardScanKey = (hash: string) => "card:scan:" + hash;
export const cardCompsKey = (cardId: string) => "card:comps:" + cardId;
export const cardSearchKey = (query: string) => "card:search:" + encodeURIComponent(query);

export async function setCache(
  redis: Redis,
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function getCache<T>(redis: Redis, key: string): Promise<T | null> {
  const v = await redis.get(key);
  if (v == null) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export async function invalidateCache(redis: Redis, pattern: string): Promise<number> {
  let cursor = "0";
  let deleted = 0;
  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = next;
    if (keys.length) {
      deleted += await redis.del(...keys);
    }
  } while (cursor !== "0");
  return deleted;
}
