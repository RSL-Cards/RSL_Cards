import { AiNarrativeRepository } from "./ai-narrative.repository.js";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { env } from "../../config/index.js";
import { ListingRepository } from "../listing/listing.repository.js";
import { EbayService } from "../listing/ebay.service.js";
import { SoldCompsService } from "../listing/sold-comps.service.js";
import { vertexAiClient } from "../../lib/vertex-ai.client.js";
import { CARD_SCAN_PROMPT } from "../../config/prompts.js";



export class AiNarrativeService {
  constructor(private readonly repository: AiNarrativeRepository) { }

  async getFeed(userId: string) {
    return this.repository.getFeed(userId);
  }

  async getInventoryNarratives(userId: string) {
    return this.repository.getInventoryNarratives(userId);
  }

  async getDailyInsight(userId: string) {
    return this.repository.getDailyInsight(userId);
  }

  async getWeeklyRecap(userId: string) {
    return this.repository.getWeeklyRecap(userId);
  }

  async getPlayerNarratives(playerName: string) {
    return this.repository.getPlayerNarratives(playerName);
  }

  async getCardNarratives(cardId: string) {
    return this.repository.getCardNarratives(cardId);
  }

  async getNarrative(id: string) {
    return this.repository.getNarrative(id);
  }

  async adminGenerate(body: any) {
    return this.repository.adminGenerate(body);
  }

  async adminApprove(id: string) {
    return this.repository.adminApprove(id);
  }

  async adminReject(id: string) {
    return this.repository.adminReject(id);
  }

  async adminUpdate(id: string, body: any) {
    return this.repository.adminUpdate(id, body);
  }

  async scanCard(body: { image: string; mimeType?: string }) {
    const { image, mimeType = "image/jpeg" } = body;
    if (!image) {
      throw new Error("image (base64) required");
    }

    if (!env.VERTEX_AI_PROJECT_ID) {
      throw new Error("Vertex AI Project ID not configured");
    }

    // Helpers
    const norm = (s: string | null | undefined) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
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

    // 1. Image hash cache check
    const imageHash = generateImageHash(image);
    const cached = await db.execute(sql`
      SELECT
        c.id AS card_id, c.year, c.set_name, c.card_number, c.manufacturer,
        c.is_rookie, c.source,
        p.name AS player_name, p.sport AS player_sport,
        cv.id AS variant_id, cv.rsl_card_id, cv.name AS variation, cv.is_autograph, cv.is_relic,
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

      // 4. Trigger price refresh in background
      if (r.variant_id) {
        const query = `${r.player_name} ${r.year} ${r.set_name} ${r.variation || ""}`.trim();
        const listingRepo = new ListingRepository();
        const ebayService = new EbayService(env);
        const soldCompsService = new SoldCompsService(env);
        listingRepo.ebaySold({ q: query, variant_id: r.variant_id, grade_key: "RAW" }, ebayService, soldCompsService)
          .catch((err) => console.error("scan-card (cache): failed to trigger price refresh:", err));
      }

      return {
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
        rslCardId: r.rsl_card_id,
        fromCache: true,
        confidence: r.confidence,
      };
    }

    // 2. Call Vertex AI
    let geminiCard: any = null;
    let lastError: any = null;

    // We can still try a fallback chain if needed, but we'll stick to the requested model.
    const modelsToTry = [
      "gemini-2.5-flash"
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`[SCAN-CARD] Attempting to scan card with model: ${modelName}...`);
        const rawResponse = await vertexAiClient.generateFromImage(CARD_SCAN_PROMPT, image, mimeType, modelName);
        const cleaned = rawResponse.replace(/```json|```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in Vertex AI response");
        geminiCard = JSON.parse(jsonMatch[0]);
        console.log(`[SCAN-CARD] ✅ Successfully identified card using model: ${modelName}`);
        break;
      } catch (err: any) {
        console.warn(`[SCAN-CARD] ❌ Model ${modelName} failed: ${err.message}`);
        lastError = err;
        // Basic fallback logic: if rate limited, server error, not found, or timeout, try next
        if (
          err.status !== 404 &&
          err.status !== 503 &&
          err.status !== 429 &&
          err.status !== 400 &&
          !err.message?.includes("timed out")
        )
          break;
      }
    }

    if (!geminiCard) {
      throw new Error(`Card scan failed: ${lastError?.message || "Unknown error"}`);
    }

    // 3. Persist to DB (best-effort, fire-and-forget errors)
    const cardId = generateCardId(geminiCard);
    let variantId: string | null = null;
    let finalCardId = cardId;

    try {
      // 3a. Ensure player exists
      const normPlayerName = geminiCard.player_name;
      const playerLookup = await db.execute(sql`
        SELECT id FROM players WHERE LOWER(name) = LOWER(${normPlayerName}) LIMIT 1
      `);
      let playerId = (playerLookup.rows[0] as any)?.id;

      if (!playerId) {
        const playerInsert = await db.execute(sql`
          INSERT INTO players (id, name, sport, created_at, updated_at)
          VALUES (gen_random_uuid(), ${normPlayerName}, ${geminiCard.sport || "basketball"}, NOW(), NOW())
          ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
          RETURNING id
        `);
        playerId = (playerInsert.rows[0] as any)?.id;
      }

      if (playerId) {
        // 3b. Ensure base card exists
        const cardPkCheck = await db.execute(sql`
          SELECT id FROM cards WHERE id = ${cardId} LIMIT 1
        `);
        let hasCard = cardPkCheck.rows.length > 0;

        if (!hasCard) {
          try {
            await db.execute(sql`
              INSERT INTO cards (
                id, player_id, year, set_name, card_number,
                manufacturer, is_rookie, source, created_at, updated_at
              ) VALUES (
                ${cardId}, ${playerId}, ${geminiCard.year ?? null}::integer,
                ${geminiCard.set_name ?? null}::varchar, ${geminiCard.card_number ?? null}::varchar,
                ${geminiCard.manufacturer ?? null}::varchar,
                ${geminiCard.is_rookie ?? false}::boolean, 'gemini', NOW(), NOW()
              )
            `);
          } catch (err: any) {
            if (!err.message.includes("uq_card_player_year_set_number")) {
              throw err;
            }
          }
        } else {
          await db.execute(sql`
            UPDATE cards SET updated_at = NOW() WHERE id = ${cardId}
          `);
        }

        // Re-verify cardId in case it already existed under a different ID
        const finalCardRow = await db.execute(sql`
          SELECT id FROM cards 
          WHERE player_id = ${playerId} 
            AND (year = ${geminiCard.year ?? null}::integer OR (year IS NULL AND ${geminiCard.year ?? null}::integer IS NULL))
            AND (set_name = ${geminiCard.set_name ?? null}::varchar OR (set_name IS NULL AND ${geminiCard.set_name ?? null}::varchar IS NULL))
            AND (
              card_number = ${geminiCard.card_number ?? null}::varchar 
              OR card_number IS NULL 
              OR ${geminiCard.card_number ?? null}::varchar IS NULL
            )
          ORDER BY (card_number = ${geminiCard.card_number ?? null}::varchar) DESC, created_at ASC
          LIMIT 1
        `);
        finalCardId = (finalCardRow.rows[0] as any)?.id || cardId;

        // 3c. Upsert variant
        const variantName = geminiCard.variation || "Base";
        const rslCardId = `${finalCardId}_${norm(variantName)}`;
        const isAutograph = geminiCard.is_autograph ?? /auto|autograph/i.test(variantName);
        const isRelic = geminiCard.is_relic ?? /patch|relic|mem/i.test(variantName);
        const isParallel = variantName.toLowerCase() !== "base";
        const printRunMatch = variantName.match(/\/(\d+)/);
        const printRun = printRunMatch ? parseInt(printRunMatch[1]) : null;

        const setName = geminiCard.set_name || null;
        const cardYear = geminiCard.year || null;

        // Ensure "Base" variant exists
        const baseVariantRes = await db.execute(sql`
          SELECT id FROM card_variants 
          WHERE card_id = ${finalCardId} 
            AND name = 'Base'
            AND (year = ${cardYear}::integer OR (year IS NULL AND ${cardYear}::integer IS NULL))
            AND (set_name = ${setName}::varchar OR (set_name IS NULL AND ${setName}::varchar IS NULL))
          LIMIT 1
        `);

        if (baseVariantRes.rows.length === 0) {
          const baseRslCardId = `${finalCardId}_base`;
          await db.execute(sql`
            INSERT INTO card_variants (id, card_id, rsl_card_id, year, set_name, name, is_parallel, is_base, created_at, updated_at)
            VALUES (gen_random_uuid(), ${finalCardId}, ${baseRslCardId}, ${cardYear}, ${setName}, 'Base', false, true, NOW(), NOW())
          `);
        }

        // Check if variation already exists
        const varRes = await db.execute(sql`
          SELECT id FROM card_variants 
          WHERE card_id = ${finalCardId} 
            AND name = ${variantName}
            AND (year = ${cardYear}::integer OR (year IS NULL AND ${cardYear}::integer IS NULL))
            AND (set_name = ${setName}::varchar OR (set_name IS NULL AND ${setName}::varchar IS NULL))
            AND (print_run = ${printRun}::integer OR (print_run IS NULL AND ${printRun}::integer IS NULL))
          LIMIT 1
        `);

        let resolvedId: string | null = null;
        if (varRes.rows.length === 0) {
          const insertRes = await db.execute(sql`
            INSERT INTO card_variants (
              id, card_id, rsl_card_id, year, set_name, name, is_parallel, is_base,
              is_autograph, is_relic, print_run,
              created_at, updated_at
            ) VALUES (
              gen_random_uuid(), ${finalCardId}, ${rslCardId}, ${cardYear}, ${setName}, ${variantName},
              ${isParallel}, ${!isParallel},
              ${isAutograph}, ${isRelic}, ${printRun},
              NOW(), NOW()
            )
            RETURNING id
          `);
          resolvedId = (insertRes.rows[0] as any)?.id || null;
        } else {
          resolvedId = (varRes.rows[0] as any)?.id || null;
        }

        if (!resolvedId) {
          const fallbackRow = await db.execute(sql`
            SELECT id FROM card_variants WHERE card_id = ${finalCardId} AND is_base = true LIMIT 1
          `);
          resolvedId = (fallbackRow.rows[0] as any)?.id || null;
        }

        variantId = resolvedId;
      }

      // 3d. Save image hash
      await db.execute(sql`
        INSERT INTO image_hashes (id, image_hash, card_id, variant_id, confidence, created_at)
        VALUES (gen_random_uuid(), ${imageHash}, ${finalCardId}, ${variantId}, ${geminiCard.confidence ?? 0.9}, NOW())
        ON CONFLICT (image_hash) DO NOTHING
      `);
    } catch (dbErr: any) {
      console.warn("scan-card: DB persist failed (non-fatal):", dbErr.message);
    }

    // 4. Trigger price refresh in background
    if (variantId) {
      const query = `${geminiCard.player_name} ${geminiCard.year} ${geminiCard.set_name} ${geminiCard.variation || ""}`.trim();
      const grades = ["RAW", "PSA_10", "PSA_9"];
      const listingRepo = new ListingRepository();
      const ebayService = new EbayService(env);
      const soldCompsService = new SoldCompsService(env);

      for (const grade of grades) {
        listingRepo.ebaySold({ q: query, variant_id: variantId, grade_key: grade }, ebayService, soldCompsService)
          .catch((err) => console.error("scan-card (live): failed to trigger price refresh for grade:", grade, err));
      }
    }

    return {
      card: geminiCard,
      cardId,
      variantId,
      rslCardId: variantId ? `${finalCardId}_${norm(geminiCard.variation || "Base")}` : null,
      fromCache: false,
      confidence: geminiCard.confidence ?? 0.9,
    };
  }
}
