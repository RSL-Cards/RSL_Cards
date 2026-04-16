import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { getNarrativeQueue } from "../config/queue.js";
import { AiNarrativeRepository } from "../repositories/ai-narrative.repository.js";
import { AiNarrativeService } from "../services/ai-narrative.service.js";
import { AiNarrativeController } from "../controllers/ai-narrative.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";

export async function narrativesRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const aiNarrativeRepository = new AiNarrativeRepository(env);
  const aiNarrativeService = new AiNarrativeService(aiNarrativeRepository);
  const aiNarrativeController = new AiNarrativeController(
    aiNarrativeService);

  // Global internal security check
  app.addHook("preHandler", internalAuthPreHandler);

  // Ping
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
    const claude_configured = Boolean(
      env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.length > 0,
    );
    return reply.send({
      service: "ai-narrative-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      cro_running: true,
      claude_configured,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/trigger-ingestion", async (request, reply) => {
    const q = getNarrativeQueue();
    if (!q) return reply.status(503).send({ error: "queue not ready" });
    const job = await q.add("ingest-manual", {}, { priority: 1 });
    request.log.info({ jobId: job.id }, "manual narrative ingestion queued");
    return reply.send({ triggered: true, jobId: String(job.id) });
  });

  // Standard Routes (prefixed with /v1/narratives in registerRoutes)
  app.get("/feed", aiNarrativeController.getFeed);
  app.get("/inventory", aiNarrativeController.getInventoryNarratives);
  app.get("/daily-insight", aiNarrativeController.getDailyInsight);
  app.get("/weekly-recap", aiNarrativeController.getWeeklyRecap);

  app.get("/player/:playerName", aiNarrativeController.getPlayerNarratives);
  app.get("/card/:cardId", aiNarrativeController.getCardNarratives);
  app.get("/:id", aiNarrativeController.getNarrative);

  // Admin Routes
  app.post("/admin/generate", aiNarrativeController.adminGenerate);
  app.patch("/admin/:id/approve", aiNarrativeController.adminApprove);
  app.patch("/admin/:id/reject", aiNarrativeController.adminReject);
  app.patch("/admin/:id", aiNarrativeController.adminUpdate);
}
