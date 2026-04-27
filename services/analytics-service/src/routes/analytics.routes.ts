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

function getUserId(req: any): string {
  return req.headers["x-user-id"] as string;
}

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
  app.get("/daily", async (req: any, reply) => {
    const userId = getUserId(req);
    const db = getDb(env);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const rows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')                          AS cards_bought,
        COUNT(*) FILTER (WHERE type = 'sell')                         AS cards_sold,
        COALESCE(SUM(price) FILTER (WHERE type = 'buy'), 0)           AS total_spent,
        COALESCE(SUM(price) FILTER (WHERE type = 'sell'), 0)          AS total_revenue,
        COALESCE(SUM(profit) FILTER (WHERE type = 'sell'), 0)         AS net_profit
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= ${todayStart.toISOString()}
    `);

    const r = (rows.rows[0] as any) ?? {};
    return reply.send({
      cards_bought: Number(r.cards_bought ?? 0),
      cards_sold: Number(r.cards_sold ?? 0),
      total_spent: parseFloat(r.total_spent ?? "0").toFixed(2),
      total_revenue: parseFloat(r.total_revenue ?? "0").toFixed(2),
      net_profit: parseFloat(r.net_profit ?? "0").toFixed(2),
    });
  });

  app.get("/today-activity", async (req: any, reply) => {
    const userId = getUserId(req);
    const db = getDb(env);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const rows = await db.execute(sql`
      SELECT
        id, type, price, profit, player_name, created_at
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= ${todayStart.toISOString()}
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const items = (rows.rows as any[]).map((r) => ({
      id: r.id,
      type: r.type,
      price: parseFloat(r.price ?? "0").toFixed(2),
      profit: r.profit != null ? parseFloat(r.profit).toFixed(2) : null,
      playerName: r.player_name ?? "Unknown Card",
      time: new Date(r.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    }));

    return reply.send({ items });
  });

  app.get("/dashboard", analyticsController.getDaily);
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
