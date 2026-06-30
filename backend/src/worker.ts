import { Worker } from "bullmq";
import { redisAdapter } from "./adapters/redis.adapter.js";
import { logger } from "./lib/logger.js";
import { db } from "./db/index.js";
import { sql, eq } from "drizzle-orm";
import { env } from "./config/index.js";
import { ListingRepository } from "./modules/listing/listing.repository.js";
import { EbayService } from "./modules/listing/ebay.service.js";
import { SoldCompsService } from "./modules/listing/sold-comps.service.js";
import { MyslabsService } from "./modules/listing/myslabs.service.js";
import { bullMqAdapter } from "./adapters/bullmq.adapter.js";
import { batchJobs } from "./db/schema/batch.js";
import { vertexAiClient } from "./lib/vertex-ai.client.js";
import { MULTI_CARD_SCAN_PROMPT, TEXT_EXTRACTION_PROMPT } from "./config/prompts.js";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const listingRepo = new ListingRepository();
const ebayService = new EbayService(env);
const soldCompsService = new SoldCompsService(env);
const myslabsService = new MyslabsService(env);

// Helper for generating card ID consistently
const norm = (s: string | null | undefined) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const generateCardId = (c: any) =>
  [norm(c.player_name), c.year, norm(c.set_name), norm(c.card_number || "")].join("_").slice(0, 255);

export const initWorker = () => {
  logger.info("👷 Starting BullMQ Worker for background tasks...");

  const worker = new Worker(
    "rsl-task-queue",
    async (job) => {
      // -------------------------------------------------------------
      // EXISTING JOBS
      // -------------------------------------------------------------
      if (job.name === "refresh_all_comps") {
        logger.info(`[WORKER] Running refresh_all_comps job (ID: ${job.id})`);
        try {
          const result = await db.execute(sql`
            SELECT DISTINCT i.variant_id, i.grade_key, c.year, c.set_name, c.card_number, p.name as player_name, cv.name as variant_name
            FROM inventory i
            JOIN card_variants cv ON i.variant_id = cv.id
            JOIN cards c ON cv.card_id = c.id
            JOIN players p ON c.player_id = p.id
            WHERE i.variant_id IS NOT NULL
          `);
          const items = result.rows as any[];
          logger.info(`[WORKER] Found ${items.length} unique variant/grade combinations in inventory.`);

          const queue = bullMqAdapter.getQueue();
          let delayMs = 0;
          for (const item of items) {
            await queue.add("refresh_single_comp", { item }, { delay: delayMs });
            delayMs += 5000; 
          }
          logger.info(`[WORKER] Completed spawner job. Enqueued ${items.length} individual comp refreshes.`);
          return { success: true, processed: items.length };
        } catch (error: any) {
          logger.error(`[WORKER] Failed to process refresh_all_comps: ${error.message}`);
          throw error;
        }
      } 
      
      else if (job.name === "refresh_single_comp") {
        const { item } = job.data;
        const query = `${item.player_name} ${item.year || ""} ${item.set_name || ""} ${item.variant_name || ""}`.trim();
        const variant_id = item.variant_id;
        const grade_key = item.grade_key || "RAW";

        logger.info(`[WORKER] Fetching live comps for single item: ${query} (Grade: ${grade_key})`);
        try { await listingRepo.ebaySold({ q: query, limit: 20, variant_id, grade_key }, ebayService, soldCompsService); } 
        catch (err: any) { logger.error(`[WORKER] Error fetching eBay comps: ${err.message}`); }
        
        await delay(1500); // Avoid rate limits
        // try { await listingRepo.myslabsSold({ q: query, limit: 20, variant_id, grade_key }, myslabsService); } 
        // catch (err: any) { logger.error(`[WORKER] Error fetching MySlabs comps: ${err.message}`); }

        await delay(1500); // Avoid rate limits
        return { success: true, processed: variant_id };
      }

      // -------------------------------------------------------------
      // NEW BATCH JOBS
      // -------------------------------------------------------------
      else if (job.name === "process_batch_upload" || job.name === "process_multi_scan") {
        const { batchId } = job.data;
        logger.info(`[WORKER] Processing batch job ${batchId} (${job.name})`);

        try {
          await db.update(batchJobs).set({ status: "processing", updatedAt: new Date() }).where(eq(batchJobs.id, batchId));
          const [batchRecord] = await db.select().from(batchJobs).where(eq(batchJobs.id, batchId));

          let cards: any[] = [];
          
          const parseGeminiResponse = (text: string) => {
            let cleaned = text.replace(/```json|```/g, "").trim();
            try {
              return JSON.parse(cleaned);
            } catch (err) {
              const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                try {
                  return JSON.parse(jsonMatch[0]);
                } catch (e2) {}
              }
              const objMatch = cleaned.match(/\{[\s\S]*\}/);
              if (objMatch) {
                try {
                  const obj = JSON.parse(objMatch[0]);
                  if (obj.cards && Array.isArray(obj.cards)) return obj.cards;
                  return [obj];
                } catch (e3) {}
              }
              logger.error(`[WORKER] Failed to parse JSON. Raw response: ${text}`);
              throw err;
            }
          };
          
          if (job.name === "process_batch_upload") {
            const rawText = batchRecord.rawText || "";
            const prompt = TEXT_EXTRACTION_PROMPT + "\n\n" + rawText;
            const res = await vertexAiClient.generateFromText(prompt, "gemini-3.1-flash-lite");
            const parsed = parseGeminiResponse(res);
            if (Array.isArray(parsed)) cards = parsed;
          } else {
            const imageBase64 = batchRecord.imageBase64;
            if (!imageBase64) throw new Error("No imageBase64 in batch record");
            const res = await vertexAiClient.generateFromImage(MULTI_CARD_SCAN_PROMPT, imageBase64, "image/jpeg", "gemini-3.1-flash-lite");
            const parsed = parseGeminiResponse(res);
            if (Array.isArray(parsed)) cards = parsed;
          }

          logger.info(`[WORKER] Extracted ${cards.length} potential cards for batch ${batchId}. Filtering out invalids...`);

          // Filter out hallucinated or empty cards
          const validCards = cards.filter((c: any) => c.player_name && c.player_name.trim().length > 0);

          logger.info(`[WORKER] Valid cards: ${validCards.length}. Pre-fetching comps...`);

          if (validCards.length === 0) {
            throw new Error("No cards identified in image or file");
          }

          const enrichedCards = [];
          for (const card of validCards) {
            const gradeKey = card.grading ? `${card.grading.company} ${card.grading.grade}` : "RAW";
            const query = card.search_string || `${card.player_name} ${card.year} ${card.set_name} ${card.variation || ""}`.trim();
            
            // Dummy variant mapping for MVP if needed (normally we'd map to variant_id)
            let compsData = null;
            try {
              // Pre-fetch eBay comps
              compsData = await listingRepo.ebaySold({ q: query, limit: 20, grade_key: gradeKey }, ebayService, soldCompsService);
            } catch (err: any) {
              logger.error(`[WORKER] Error pre-fetching comps for ${query}: ${err.message}`);
            }

            enrichedCards.push({
              ...card,
              id: generateCardId(card),
              gradeKey,
              comps: compsData 
            });

            // Delay between fetching each card's comps to avoid Vertex AI / eBay API rate limits
            if (cards.length > 1) {
              await delay(2000);
            }
          }

          await db.update(batchJobs).set({ 
            status: "completed", 
            resultsJson: enrichedCards,
            updatedAt: new Date() 
          }).where(eq(batchJobs.id, batchId));
          
          logger.info(`[WORKER] Completed batch job ${batchId}`);
          return { success: true, count: cards.length };

        } catch (error: any) {
          logger.error(`[WORKER] Failed batch job ${batchId}: ${error.message}`);
          await db.update(batchJobs).set({ 
            status: "failed", 
            error: error.message,
            updatedAt: new Date() 
          }).where(eq(batchJobs.id, batchId));
          throw error;
        }
      }
    },
    {
      connection: redisAdapter.getClient(),
      concurrency: 1, 
    }
  );

  worker.on("completed", (job) => {
    logger.info(`👷 Job ${job.id} (${job.name}) has completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`👷 Job ${job?.id} (${job?.name}) has failed with error: ${err.message}`);
  });

  return worker;
};
