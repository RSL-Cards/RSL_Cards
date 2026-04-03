import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getNarrativeQueue } from "../config/queue.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

export async function narrativesRoutes(app: FastifyInstance, env: Env): Promise<void> {
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
    const claude_configured = Boolean(env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.length > 0);
    return reply.send({
      service: "ai-narrative-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      cron_running: true,
      claude_configured,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/trigger-ingestion", async (request, reply) => {
    const q = getNarrativeQueue();
    if (!q) {
      return reply.status(503).send({ error: "queue not ready" });
    }
    const job = await q.add("ingest-manual", {}, { priority: 1 });
    request.log.info({ jobId: job.id }, "manual narrative ingestion queued");
    return reply.send({ triggered: true, jobId: String(job.id) });
  });

}
