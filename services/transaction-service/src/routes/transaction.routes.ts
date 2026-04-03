import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getTransactionQueue } from "../config/queue.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

export async function transactionRoutes(app: FastifyInstance, env: Env): Promise<void> {
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
    let queue_connected = false;
    try {
      const q = getTransactionQueue(env);
      queue_connected = !!(await q.getJobCounts());
    } catch {
      queue_connected = false;
    }
    return reply.send({
      service: "transaction-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      queue_connected,
      timestamp: new Date().toISOString(),
    });
  });
}
