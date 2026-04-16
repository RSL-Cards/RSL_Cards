import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

function dbNameFromUrl(url: string): string {
  const base = url.split("?")[0] ?? url;
  const seg = base.split("/").filter(Boolean);
  return seg[seg.length - 1] ?? "postgres";
}

async function redisServerVersion(env: Env): Promise<string | undefined> {
  const info = await getRedis(env).info("server");
  const line = info.split("\r\n").find((l) => l.startsWith("redis_version:"));
  return line?.split(":")[1]?.trim();
}

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const env = (app as any).env as Env;
  app.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              service: { type: "string" },
              environment: { type: "string" },
              version: { type: "string" },
              uptime: { type: "number" },
              timestamp: { type: "string" },
              checks: { type: "object" },
            },
          },
          503: {
            type: "object",
            properties: {
              status: { type: "string" },
              service: { type: "string" },
              checks: { type: "object" },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const service = "inventory-service";
      const environment = env.NODE_ENV;
      const dbName = dbNameFromUrl(env.DATABASE_URL);
      let dbStatus: "ok" | "error" = "ok";
      let dbLatency = 0;
      let dbErr: string | undefined;
      const t0 = performance.now();
      try {
        await getDb(env).execute(sql`SELECT 1`);
        dbLatency = Math.round(performance.now() - t0);
      } catch (e) {
        dbStatus = "error";
        dbErr = e instanceof Error ? e.message : String(e);
      }

      let redisStatus: "ok" | "error" = "ok";
      let redisLatency = 0;
      let redisVer: string | undefined;
      let redisErr: string | undefined;
      const t1 = performance.now();
      try {
        await getRedis(env).ping();
        redisLatency = Math.round(performance.now() - t1);
        redisVer = await redisServerVersion(env);
      } catch (e) {
        redisStatus = "error";
        redisErr = e instanceof Error ? e.message : String(e);
      }

      const healthy = dbStatus === "ok" && redisStatus === "ok";
      if (!healthy) {
        return reply.status(503).send({
          status: "error",
          service,
          checks: {
            database: dbStatus === "ok" ? { status: "ok", latency_ms: dbLatency } : { status: "error", error: dbErr },
            redis:
              redisStatus === "ok"
                ? { status: "ok", latency_ms: redisLatency }
                : { status: "error", error: redisErr },
          },
        });
      }

      return reply.send({
        status: "ok",
        service,
        environment,
        version: "1.0.0",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "ok",
            latency_ms: dbLatency,
            database: dbName,
          },
          redis: {
            status: "ok",
            latency_ms: redisLatency,
            version: redisVer ?? "unknown",
          },
        },
      });
    },
  );
}
