import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { identifyCard } from "../clients/ximilar.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { rateLimitUserKey } from "../utils/rate-limit-user.js";

export async function cardsRoutes(app: FastifyInstance, env: Env): Promise<void> {
  const redis = getRedis(env);

  await app.register(
    async (r) => {
      await r.register(rateLimit, {
        max: 100,
        timeWindow: 60_000,
        redis,
      });
      r.get("/ping", async (_request, reply) => {
        let db_connected = false;
        try {
          await getDb(env).execute(sql`SELECT 1`);
          db_connected = true;
        } catch {
          db_connected = false;
        }
        let redis_connected = false;
        try {
          redis_connected = (await getRedis(env).ping()) === "PONG";
        } catch {
          redis_connected = false;
        }
        const ximilar_configured = Boolean(env.XIMILAR_API_KEY && env.XIMILAR_API_KEY.length > 0);
        return reply.send({
          service: "card-db-service",
          environment: env.NODE_ENV,
          db_connected,
          redis_connected,
          cache_enabled: true,
          ximilar_configured,
          timestamp: new Date().toISOString(),
        });
      });
    },
    { prefix: "" },
  );

  await app.register(
    async (r) => {
      await r.register(rateLimit, {
        max: 60,
        timeWindow: 60_000,
        redis,
        keyGenerator: (req) => `card:scan:${rateLimitUserKey(req)}`,
        errorResponseBuilder: (_req, context) => ({
          error: "Rate limit exceeded",
          retryAfter: Math.max(1, Math.ceil(context.ttl / 1000)),
        }),
      });
      r.post("/scan", async (request, reply) => {
        const body = request.body as { imageBase64?: string };
        const id = await identifyCard(env, body.imageBase64 ?? "", request.log);
        return reply.send({ card: id });
      });
    },
    { prefix: "" },
  );

  await app.register(
    async (r) => {
      await r.register(rateLimit, {
        max: 30,
        timeWindow: 60_000,
        redis,
        keyGenerator: (req) => `card:comps:${rateLimitUserKey(req)}`,
        errorResponseBuilder: (_req, context) => ({
          error: "Rate limit exceeded",
          retryAfter: Math.max(1, Math.ceil(context.ttl / 1000)),
        }),
      });
      r.get<{ Params: { cardId: string } }>("/:cardId/comps", async (request, reply) => {
        const { cardId } = request.params;
        return reply.send({
          cardId,
          comps: [],
          message: "Stub — wire eBay comps and price history",
          timestamp: new Date().toISOString(),
        });
      });
    },
    { prefix: "" },
  );
}
