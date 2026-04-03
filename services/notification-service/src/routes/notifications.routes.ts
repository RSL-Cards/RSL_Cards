import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

export async function notificationsRoutes(app: FastifyInstance, env: Env): Promise<void> {
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
      service: "notification-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      fcm_configured: Boolean(env.FIREBASE_SERVICE_ACCOUNT && env.FIREBASE_SERVICE_ACCOUNT.length > 0),
      email_configured: Boolean(env.RESEND_API_KEY && env.RESEND_API_KEY.length > 0),
      timestamp: new Date().toISOString(),
    });
  });
}
