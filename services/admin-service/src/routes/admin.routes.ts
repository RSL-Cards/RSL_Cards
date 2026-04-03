import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { getServicePortsForNodeEnv } from "@rsl/shared-constants";
import type { Env } from "../config/env.js";
import { adminAuthPreHandler } from "../middleware/admin-auth.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

const SERVICE_NAMES = [
  "auth-service",
  "user-service",
  "inventory-service",
  "transaction-service",
  "listing-service",
  "card-db-service",
  "ai-narrative-service",
  "notification-service",
  "analytics-service",
] as const;

function serviceHealthUrl(
  name: (typeof SERVICE_NAMES)[number],
  ports: Record<string, number>,
): string {
  if (process.env.ADMIN_HEALTH_IN_DOCKER === "1") {
    return `http://${name}:3000/health`;
  }
  const base = process.env.ADMIN_HEALTH_BASE_URL ?? "http://127.0.0.1";
  return `${base}:${ports[name]}/health`;
}

export async function adminRoutes(app: FastifyInstance, env: Env): Promise<void> {
  app.get("/ping", async (_request, reply) => {
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
    return reply.send({
      service: "admin-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      message: "admin ping",
      timestamp: new Date().toISOString(),
    });
  });

  app.get(
    "/health-all",
    { preHandler: (req, reply) => adminAuthPreHandler(env, req, reply) },
    async (_request, reply) => {
      const ports = getServicePortsForNodeEnv(env.NODE_ENV);
      const results = await Promise.allSettled(
        SERVICE_NAMES.map(async (name) => {
          const t0 = performance.now();
          const res = await fetch(serviceHealthUrl(name, ports), {
            signal: AbortSignal.timeout(5000),
          });
          const latency_ms = Math.round(performance.now() - t0);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return { name, latency_ms };
        }),
      );

      const services: Record<string, { status: string; latency_ms?: number; error?: string }> = {};
      let healthy = 0;
      let unhealthy = 0;
      for (let i = 0; i < SERVICE_NAMES.length; i++) {
        const name = SERVICE_NAMES[i];
        const r = results[i];
        if (r.status === "fulfilled") {
          services[name] = { status: "ok", latency_ms: r.value.latency_ms };
          healthy++;
        } else {
          const err = r.reason instanceof Error ? r.reason.message : String(r.reason);
          services[name] = { status: "error", error: err };
          unhealthy++;
        }
      }

      let overall: "ok" | "degraded" | "down" = "ok";
      if (unhealthy === SERVICE_NAMES.length) overall = "down";
      else if (unhealthy > 0) overall = "degraded";

      return reply.status(200).send({
        overall,
        services,
        healthy,
        unhealthy,
        timestamp: new Date().toISOString(),
      });
    },
  );
}
