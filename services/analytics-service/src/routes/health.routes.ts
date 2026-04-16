import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getReadDb } from "../config/db-read.js";
import { getRedis } from "../config/redis.js";

async function redisServerVersion(env: Env): Promise<string | undefined> {
  const info = await getRedis(env).info("server");
  const line = info.split("\r\n").find((l) => l.startsWith("redis_version:"));
  return line?.split(":")[1]?.trim();
}

function dbNameFromUrl(url: string): string {
  const base = url.split("?")[0] ?? url;
  const seg = base.split("/").filter(Boolean);
  return seg[seg.length - 1] ?? "postgres";
}

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const env = (app as any).env as Env;
  app.get(
    "/", async (_request, reply) => {
    const service = "analytics-service";
    const environment = env.NODE_ENV;
    const dbName = dbNameFromUrl(env.DATABASE_URL);

    let primaryStatus: "ok" | "error" = "ok";
    let primaryLatency = 0;
    let primaryErr: string | undefined;
    const t0 = performance.now();
    try {
      await getDb(env).execute(sql`SELECT 1`);
      primaryLatency = Math.round(performance.now() - t0);
    } catch (e) {
      primaryStatus = "error";
      primaryErr = e instanceof Error ? e.message : String(e);
    }

    let replicaStatus: "ok" | "error" = "ok";
    let replicaLatency = 0;
    let replicaErr: string | undefined;
    const t1 = performance.now();
    try {
      await getReadDb(env).execute(sql`SELECT 1`);
      replicaLatency = Math.round(performance.now() - t1);
    } catch (e) {
      replicaStatus = "error";
      replicaErr = e instanceof Error ? e.message : String(e);
    }

    let redisStatus: "ok" | "error" = "ok";
    let redisLatency = 0;
    let redisVer: string | undefined;
    let redisErr: string | undefined;
    const t2 = performance.now();
    try {
      await getRedis(env).ping();
      redisLatency = Math.round(performance.now() - t2);
      redisVer = await redisServerVersion(env);
    } catch (e) {
      redisStatus = "error";
      redisErr = e instanceof Error ? e.message : String(e);
    }

    const healthy = primaryStatus === "ok" && replicaStatus === "ok" && redisStatus === "ok";
    if (!healthy) {
      return reply.status(503).send({
        status: "error",
        service,
        checks: {
          database_primary:
            primaryStatus === "ok"
              ? { status: "ok", latency_ms: primaryLatency }
              : { status: "error", error: primaryErr },
          read_replica:
            replicaStatus === "ok"
              ? { status: "ok", latency_ms: replicaLatency }
              : { status: "error", error: replicaErr },
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
        database_primary: { status: "ok", latency_ms: primaryLatency, database: dbName },
        read_replica: { status: "ok", latency_ms: replicaLatency },
        redis: { status: "ok", latency_ms: redisLatency, version: redisVer ?? "unknown" },
      },
    });
  });
}
