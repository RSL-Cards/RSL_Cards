import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getReadDb } from "../config/db-read.js";
import { getRedis } from "../config/redis.js";
import { getSnapshotQueue } from "../config/queue.js";
import { AnalyticsRepository } from "../repositories/analytics.repository.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";

export async function analyticsRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const analyticsRepository = new AnalyticsRepository(env);
  const analyticsService = new AnalyticsService(analyticsRepository);
  const analyticsController = new AnalyticsController(analyticsService);

  // Global internal security check
  app.addHook("preHandler", internalAuthPreHandler);

  // Ping
  app.get("/ping", async (_request, reply) => {
    let primary_db_connected = false;
    try {
      await getDb(env).execute(sql`SELECT 1`);
      primary_db_connected = true;
    } catch {
      primary_db_connected = false;
    }
    let read_replica_connected = false;
    try {
      await getReadDb(env).execute(sql`SELECT 1`);
      read_replica_connected = true;
    } catch {
      read_replica_connected = false;
    }
    let redis_connected = false;
    try {
      redis_connected = (await getRedis(env).ping()) === "PONG";
    } catch {
      redis_connected = false;
    }
    return reply.send({
      service: "analytics-service",
      environment: env.NODE_ENV,
      primary_db_connected,
      read_replica_connected,
      redis_connected,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/trigger-snapshot", async (request, reply) => {
    const q = getSnapshotQueue();
    if (!q) return reply.status(503).send({ error: "queue not ready" });
    const job = await q.add("snapshot-manual", {
      date: new Date().toISOString().slice(0, 10),
    });
    request.log.info({ jobId: job.id }, "manual snapshot queued");
    return reply.send({ triggered: true, jobId: String(job.id) });
  });

  // Standard Routes (prefixed with /v1/analytics in registerRoutes)
  app.get("/daily", analyticsController.getDaily);
  app.get("/report", analyticsController.getReport);
  app.get("/report/export", analyticsController.exportReport);
  app.get("/profit/sport", analyticsController.getProfitBySport);
  app.get("/profit/channel", analyticsController.getProfitByChannel);
  app.get("/top-cards", analyticsController.getTopCards);
  app.get("/inventory-trend", analyticsController.getInventoryValueTrend);
  app.get("/platforms", analyticsController.getPlatformPerformance);
  app.get("/tax/:year", analyticsController.getTaxYear);
  app.get("/tax/:year/export", analyticsController.exportTaxYear);

  app.get("/expenses", analyticsController.getExpenses);
  app.post("/expenses", analyticsController.postExpense);
  app.patch("/expenses/:id", analyticsController.patchExpense);
  app.delete("/expenses/:id", analyticsController.deleteExpense);

  app.get("/collection", analyticsController.getCollection);
  app.get("/collection/recap", analyticsController.getWeeklyRecap);
}
