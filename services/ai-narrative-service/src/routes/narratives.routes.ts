import type { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";
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
  "manufacturer": "Panini",
  "is_rookie": false,
  "is_autograph": false,
  "is_relic": false,
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
- "manufacturer": the card company (e.g. "Panini", "Topps", "Upper Deck", "Bowman")
- "is_rookie": true if card has RC logo, "Rookie" text, or is player's first-year card
- "is_autograph": true if card has a visible on-card or sticker autograph
- "is_relic": true if card contains embedded patch/jersey/memorabilia window
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

      const db = getDb(env);

      // ── helpers ──────────────────────────────────────────────────────────
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const generateCardId = (c: {
        player_name: string;
        year: number;
        set_name: string;
        variation?: string;
        card_number?: string;
      }) =>
        [
          norm(c.player_name),
          c.year,
          norm(c.set_name),
          norm(c.card_number || ""),
        ]
          .join("_")
          .slice(0, 255);
      const generateImageHash = (b: string) =>
        createHash("sha256").update(b).digest("hex").slice(0, 64);

      // ── 1. Image hash cache check ─────────────────────────────────────────
      const imageHash = generateImageHash(image);
      const cached = await db.execute(sql`
        SELECT
          c.id AS card_id, c.year, c.set_name, c.card_number, c.sport, c.manufacturer,
          c.is_rookie, c.stock_image_url, c.source,
          p.name AS player_name, p.sport AS player_sport,
          cv.id AS variant_id, cv.name AS variation, cv.is_autograph, cv.is_relic,
          cv.is_parallel, cv.print_run,
          ih.confidence
        FROM image_hashes ih
        JOIN cards c ON c.id = ih.card_id
        JOIN players p ON p.id = c.player_id
        LEFT JOIN card_variants cv ON cv.id = ih.variant_id
        WHERE ih.image_hash = ${imageHash}
        LIMIT 1
      `);

      if (cached.rows.length > 0 && (cached.rows[0] as any).variant_id) {
        const r = cached.rows[0] as any;
        request.log.info({ cardId: r.card_id }, "[DB_CACHE] Image hash hit: card already identified in database");

        // ── 4. Trigger price refresh in background ───────────────────────────
        if (r.variant_id) {
          const query = `${r.player_name} ${r.year} ${r.set_name} ${r.variation || ""}`.trim();
          const listingUrl = `http://listing-service:${env.LISTING_SERVICE_PORT}/v1/listings/ebay/sold?q=${encodeURIComponent(query)}&variant_id=${r.variant_id}&grade_key=RAW`;
          fetch(listingUrl, {
            headers: { "x-service-key": env.INTERNAL_SERVICE_KEY },
          }).catch((err) =>
            request.log.warn(
              { err: err.message },
              "scan-card (cache): failed to trigger price refresh",
            ),
          );
        }

        return reply.send({
          card: {
            player_name: r.player_name,
            year: r.year,
            set_name: r.set_name,
            variation: r.variation,
            card_number: r.card_number,
            sport: r.sport ?? r.player_sport,
            manufacturer: r.manufacturer ?? null,
            is_rookie: r.is_rookie ?? false,
            is_autograph: r.is_autograph ?? false,
            is_relic: r.is_relic ?? false,
            grading: null,
          },
          cardId: r.card_id,
          variantId: r.variant_id,
          fromCache: true,
          confidence: r.confidence,
        });
      }

      // ── 2. Call Gemini ────────────────────────────────────────────────────
      request.log.info("[ORIGINAL_API] Identifying card via Gemini AI Vision");
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
      ];

      let geminiCard: any = null;
      let lastError: any = null;
      for (const modelName of modelsToTry) {
        try {
          request.log.info({ model: modelName }, "scan-card: trying model");
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([
            CARD_SCAN_PROMPT,
            { inlineData: { data: image, mimeType } },
          ]);
          const raw = result.response.text();
          const cleaned = raw.replace(/```json|```/g, "").trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("No JSON in Gemini response");
          geminiCard = JSON.parse(jsonMatch[0]);
          break;
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

      if (!geminiCard) {
        if (lastError?.status === 429)
          return reply
            .status(429)
            .send({ error: "Rate limit exceeded. Wait 30-60s." });
        return reply
          .status(500)
          .send({ error: "Card scan failed", message: lastError?.message });
      }

      // ── 3. Persist to DB (best-effort, fire-and-forget errors) ───────────
      const cardId = generateCardId(geminiCard);
      let variantId: string | null = null;

      try {
        // 3a. Ensure player exists
        const normPlayerName = geminiCard.player_name;
        const playerInsert = await db.execute(sql`
          INSERT INTO players (id, name, sport, created_at, updated_at)
          VALUES (gen_random_uuid(), ${normPlayerName}, ${geminiCard.sport || "basketball"}, NOW(), NOW())
          ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
          RETURNING id
        `);
        
        let playerId = (playerInsert.rows[0] as any)?.id;
        if (!playerId) {
          const playerLookup = await db.execute(sql`
            SELECT id FROM players WHERE name = ${normPlayerName} LIMIT 1
          `);
          playerId = (playerLookup.rows[0] as any)?.id;
        }
        let finalCardId = cardId;

        if (playerId) {
          // 3b. Upsert base card
          // We use a separate query to handle the multiple unique constraints (id and uq_card_player_year_set_number)
          await db.execute(sql`
            INSERT INTO cards (
              id, player_id, year, set_name, card_number,
              manufacturer, is_rookie, source, created_at, updated_at
            ) VALUES (
              ${cardId}, ${playerId}, ${geminiCard.year ?? null},
              ${geminiCard.set_name ?? null}, ${geminiCard.card_number ?? null},
              ${geminiCard.manufacturer ?? null},
              ${geminiCard.is_rookie ?? false}, 'gemini', NOW(), NOW()
            )
            ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
          `).catch(async (err) => {
            if (err.message.includes("uq_card_player_year_set_number")) {
              request.log.info("Card already exists by player/year/set/number constraint");
            } else {
              throw err;
            }
          });

          // Re-verify cardId in case it already existed under a different ID
          // We search with a more flexible card_number check to handle cases where OCR might miss it
          const finalCardRow = await db.execute(sql`
            SELECT id FROM cards 
            WHERE player_id = ${playerId} 
              AND year = ${geminiCard.year ?? null} 
              AND set_name = ${geminiCard.set_name ?? null}
              AND (
                card_number = ${geminiCard.card_number ?? null} 
                OR card_number IS NULL 
                OR ${geminiCard.card_number ?? null} IS NULL
              )
            ORDER BY (card_number = ${geminiCard.card_number ?? null}) DESC, created_at ASC
            LIMIT 1
          `);
          finalCardId = (finalCardRow.rows[0] as any)?.id || cardId;

          // 3c. Upsert variant — all columns from card_variants schema
          const variantName = geminiCard.variation || "Base";
          const isAutograph = geminiCard.is_autograph ?? /auto|autograph/i.test(variantName);
          const isRelic = geminiCard.is_relic ?? /patch|relic|mem/i.test(variantName);
          const isParallel = variantName.toLowerCase() !== "base";
          const printRunMatch = variantName.match(/\/(\d+)/);
          const printRun = printRunMatch ? parseInt(printRunMatch[1]) : null;

          const setName = geminiCard.set_name || null;
          const cardYear = geminiCard.year || null;

          // STEP 1: Ensure at least a "Base" variant exists for this card
          await db.execute(sql`
            INSERT INTO card_variants (id, card_id, year, set_name, name, is_parallel, is_base, created_at, updated_at)
            VALUES (gen_random_uuid(), ${finalCardId}, ${cardYear}, ${setName}, 'Base', false, true, NOW(), NOW())
            ON CONFLICT (card_id, year, set_name, name, print_run) DO NOTHING
          `);

          // STEP 2: Upsert the identified variation
          request.log.info({ cardId: finalCardId, cardYear, setName, variantName }, "Upserting card variant");
          const insertRes = await db.execute(sql`
            INSERT INTO card_variants (
              id, card_id, year, set_name, name, is_parallel, is_base,
              is_autograph, is_relic, print_run,
              created_at, updated_at
            ) VALUES (
              gen_random_uuid(), ${finalCardId}, ${cardYear}, ${setName}, ${variantName},
              ${isParallel}, ${!isParallel},
              ${isAutograph}, ${isRelic}, ${printRun},
              NOW(), NOW()
            )
            ON CONFLICT (card_id, year, set_name, name, print_run) DO NOTHING
            RETURNING id
          `);

          // STEP 3: Robust lookup for variant_id
          let resolvedId = (insertRes.rows[0] as any)?.id;
          if (!resolvedId) {
            const variantRow = await db.execute(sql`
              SELECT id FROM card_variants 
              WHERE card_id = ${finalCardId} 
                AND (year = ${cardYear} OR year IS NULL OR ${cardYear} IS NULL)
                AND (set_name = ${setName} OR set_name IS NULL OR ${setName} IS NULL)
                AND (LOWER(name) = LOWER(${variantName}) OR (is_base = true AND LOWER(${variantName}) = 'base'))
              ORDER BY 
                (LOWER(name) = LOWER(${variantName})) DESC, 
                (year = ${cardYear}) DESC,
                (set_name = ${setName}) DESC,
                is_base DESC, created_at ASC
              LIMIT 1
            `);
            resolvedId = (variantRow.rows[0] as any)?.id;
          }
          
          // STEP 4: Absolute fallback to Base if still null
          if (!resolvedId) {
            const fallbackRow = await db.execute(sql`
              SELECT id FROM card_variants WHERE card_id = ${finalCardId} AND is_base = true LIMIT 1
            `);
            resolvedId = (fallbackRow.rows[0] as any)?.id;
          }
          
          variantId = resolvedId ?? null;
          request.log.info({ variantId, variantName, cardId: finalCardId }, "Resolved variantId");
        }

        // 3d. Save image hash so next scan of same image is instant
        await db.execute(sql`
          INSERT INTO image_hashes (id, image_hash, card_id, variant_id, confidence, created_at)
          VALUES (gen_random_uuid(), ${imageHash}, ${finalCardId}, ${variantId}, ${geminiCard.confidence ?? 0.9}, NOW())
          ON CONFLICT (image_hash) DO NOTHING
        `);

        request.log.info({ cardId: finalCardId, variantId }, "scan-card: persisted to DB");
      } catch (dbErr: any) {
        request.log.warn(
          { err: dbErr.message },
          "scan-card: DB persist failed (non-fatal)",
        );
      }

      request.log.info(
        { cardId, variantId, source: "gemini-ai" },
        "scan-card: identified via Gemini AI",
      );

      // ── 4. Trigger price refresh in background for common grades ──────────
      if (variantId) {
        const query = `${geminiCard.player_name} ${geminiCard.year} ${geminiCard.set_name} ${geminiCard.variation || ""}`.trim();
        const grades = ["RAW", "PSA_10", "PSA_9"];
        
        for (const grade of grades) {
          const listingUrl = `http://listing-service:${env.LISTING_SERVICE_PORT}/v1/listings/ebay/sold?q=${encodeURIComponent(query)}&variant_id=${variantId}&grade_key=${grade}`;
          fetch(listingUrl, {
            headers: { "x-service-key": env.INTERNAL_SERVICE_KEY },
          }).catch((err) =>
            request.log.warn(
              { err: err.message, grade },
              "scan-card: failed to trigger price refresh",
            ),
          );
        }
      }

      return reply.send({
        card: geminiCard,
        cardId,
        variantId,
        fromCache: false,
        confidence: geminiCard.confidence ?? 0.9,
      });
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
