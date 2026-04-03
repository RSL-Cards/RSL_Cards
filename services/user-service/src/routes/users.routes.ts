import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

export async function usersRoutes(app: FastifyInstance, env: Env): Promise<void> {
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
      const pong = await getRedis(env).ping();
      redis_connected = pong === "PONG";
    } catch {
      redis_connected = false;
    }
    return reply.send({
      service: "user-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      message: "user-service is running",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/status", async (_request, reply) => {
    let db_connected = false;
    try {
      await getDb(env).execute(sql`SELECT 1`);
      db_connected = true;
    } catch {
      db_connected = false;
    }
    let redis_connected = false;
    try {
      const pong = await getRedis(env).ping();
      redis_connected = pong === "PONG";
    } catch {
      redis_connected = false;
    }
    return reply.send({
      status: db_connected && redis_connected ? "healthy" : "degraded",
      service: "user-service",
      checks: {
        database: db_connected ? "ok" : "error",
        redis: redis_connected ? "ok" : "error",
      },
      timestamp: new Date().toISOString(),
    });
  });
}
