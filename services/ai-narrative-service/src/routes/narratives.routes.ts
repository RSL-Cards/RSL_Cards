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
import { GoogleGenerativeAI } from "@google/generative-ai";

const CARD_SCAN_PROMPT = `You are an expert sports card identifier. Analyze this card image and extract the following details in strict JSON format with NO markdown, NO extra text.

Return ONLY this JSON:
{
  "player_name": "Full Player Name",
  "year": 2017,
  "set_name": "Panini Prizm",
  "variation": "Silver Prizm",
  "sport": "football",
  "card_number": "269",
  "grading": {
    "company": "PSA",
    "grade": "10",
    "cert_number": "12345678"
  },
  "confidence": 0.95
}

Rules:
- "year" must be a number
- "confidence" 0.0-1.0 based on image clarity
- "sport": "football" | "basketball" | "baseball" | "hockey" | "soccer" | "other"
- "variation": the parallel/refractor name exactly as it appears on the card or is commonly known on eBay (e.g. "Silver Prizm", "Gold Refractor", "Holo", "Base", "Blue Wave", "Red /299"). Include the print run if visible (e.g. "Orange /49"). If base/no variation, use "Base"
- "card_number": the number printed on the card (e.g. "269", "RC-15"). Omit the # symbol. Use null if not visible
- "set_name": the brand+product name as used on eBay (e.g. "Panini Prizm", "Topps Chrome", "Bowman Draft"). Do NOT include the year in set_name
- If grading label (PSA/BGS/SGC/CSG slab) not visible, omit "grading" field entirely
- If a field is not visible or not determinable, use null
- Return ONLY the JSON object, nothing else`;

// ── Public routes — no auth required ──
export async function publicNarrativeRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

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

  app.post<{ Body: { image: string; mimeType?: string } }>(
    "/scan-card",
    async (request, reply) => {
      const { image, mimeType = "image/jpeg" } = request.body;
      if (!image)
        return reply.status(400).send({ error: "image (base64) required" });

      const apiKey = env.GOOGLE_GEN_AI_KEY;
      if (!apiKey)
        return reply.status(503).send({ error: "Gemini not configured" });

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelsToTry = [
        // "gemini-2.0-flash-lite",
        // "gemini-2.0-flash",
        "gemini-2.5-flash",
        // "gemini-2.5-flash-lite",
      ];

      let lastError: any = null;
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([
            CARD_SCAN_PROMPT,
            { inlineData: { data: image, mimeType } },
          ]);
          const raw = result.response.text();
          const cleaned = raw.replace(/```json|```/g, "").trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("No JSON in Gemini response");
          const card = JSON.parse(jsonMatch[0]);
          return reply.send({ card, confidence: card.confidence ?? 0.9 });
        } catch (err: any) {
          lastError = err;
          request.log.warn(
            { model: modelName, err: err.message },
            "Gemini model failed, trying next",
          );
          if (
            err.status !== 404 &&
            err.status !== 503 &&
            err.status !== 429 &&
            err.status !== 400
          )
            break;
        }
      }

      if (lastError?.status === 429) {
        return reply
          .status(429)
          .send({ error: "Rate limit exceeded. Wait 30-60s." });
      }
      return reply
        .status(500)
        .send({ error: "Card scan failed", message: lastError?.message });
    },
  );
}

// ── Auth-gated routes — require x-service-key ──
export async function narrativesRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  const aiNarrativeRepository = new AiNarrativeRepository(env);
  const aiNarrativeService = new AiNarrativeService(aiNarrativeRepository);
  const aiNarrativeController = new AiNarrativeController(aiNarrativeService);

  app.addHook("preHandler", internalAuthPreHandler);

  app.get("/trigger-ingestion", async (request, reply) => {
    const q = getNarrativeQueue();
    if (!q) return reply.status(503).send({ error: "queue not ready" });
    const job = await q.add("ingest-manual", {}, { priority: 1 });
    request.log.info({ jobId: job.id }, "manual narrative ingestion queued");
    return reply.send({ triggered: true, jobId: String(job.id) });
  });

  app.get("/feed", aiNarrativeController.getFeed);
  app.get("/inventory", aiNarrativeController.getInventoryNarratives);
  app.get("/daily-insight", aiNarrativeController.getDailyInsight);
  app.get("/weekly-recap", aiNarrativeController.getWeeklyRecap);

  app.get("/player/:playerName", aiNarrativeController.getPlayerNarratives);
  app.get("/card/:cardId", aiNarrativeController.getCardNarratives);
  app.get("/:id", aiNarrativeController.getNarrative);

  app.post("/admin/generate", aiNarrativeController.adminGenerate);
  app.patch("/admin/:id/approve", aiNarrativeController.adminApprove);
  app.patch("/admin/:id/reject", aiNarrativeController.adminReject);
  app.patch("/admin/:id", aiNarrativeController.adminUpdate);
}
