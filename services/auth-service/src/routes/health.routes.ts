import { z } from 'zod';
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
          200: z.object({
            status: z.string(),
            service: z.string(),
            environment: z.string(),
            version: z.string(),
            uptime: z.number(),
            timestamp: z.string(),
            checks: z.record(z.any()),
          }),
          503: z.object({
            status: z.string(),
            service: z.string(),
            checks: z.record(z.any()),
          }),
        },
      },
    },
    async (_request, reply) => {
      const service = "auth-service";
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

  app.get(
    "/fleet",
    {
      schema: {
        description: "Aggregates health across all known microservices dynamically",
        response: {
          200: z.any(),
          503: z.any()
        },
      },
    },
    async (_request, reply) => {
      const isDocker = process.env.AUTH_GATEWAY_IN_DOCKER === "1";
      const servicesConfig = [
        { name: "auth-service", port: env.AUTH_SERVICE_PORT },
        { name: "user-service", port: env.USER_SERVICE_PORT },
        { name: "inventory-service", port: env.INVENTORY_SERVICE_PORT },
        { name: "transaction-service", port: env.TRANSACTION_SERVICE_PORT },
        { name: "listing-service", port: env.LISTING_SERVICE_PORT },
        { name: "card-db-service", port: env.CARD_DB_SERVICE_PORT },
        { name: "ai-narrative-service", port: env.AI_NARRATIVE_SERVICE_PORT },
        { name: "notification-service", port: env.NOTIFICATION_SERVICE_PORT },
        { name: "analytics-service", port: env.ANALYTICS_SERVICE_PORT },
        { name: "admin-service", port: env.ADMIN_SERVICE_PORT },
      ];

      const results = await Promise.all(
        servicesConfig.map(async (svc) => {
          const url = isDocker
            ? `http://${svc.name}:3000/health`
            : `http://localhost:${svc.port}/health`;

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            if (!res.ok) {
               return { name: svc.name, status: "error", code: res.status };
            }
            const data = await res.json();
            return { name: svc.name, status: "ok", data };
          } catch (e: any) {
            return { name: svc.name, status: "unreachable", error: e.message };
          }
        })
      );

      const isHealthy = results.every((r) => r.status === "ok");

      return reply.status(isHealthy ? 200 : 503).send({
        fleet_status: isHealthy ? "online" : "degraded",
        deployment_mode: isDocker ? "docker-network" : "localhost",
        timestamp: new Date().toISOString(),
        nodes: results,
      });
    }
  );
}
