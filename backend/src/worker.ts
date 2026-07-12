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
import { sseService } from "./modules/notification/sse.service.js";
import { NotificationRepository } from "./modules/notification/notification.repository.js";
import { NotificationService } from "./modules/notification/notification.service.js";
import { batchJobs } from "./db/schema/batch.js";
import { narratives } from "./db/schema/index.js";
import { vertexAiClient } from "./lib/vertex-ai.client.js";
import { MULTI_CARD_SCAN_PROMPT, TEXT_EXTRACTION_PROMPT } from "./config/prompts.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

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

      else if (job.name === "generate_ai_insights") {
        logger.info(`[WORKER] Running generate_ai_insights job (ID: ${job.id})`);
        try {
          // 1. Fetch top cards in user active inventory with price shifts >= 15% in last 30 days
          const candidates = await db.execute(sql`
            SELECT 
              p.name as player_name,
              p.sport,
              c.id as card_id,
              c.year,
              c.set_name,
              cv.name as variant_name,
              cs.avg_sold_price as price,
              cs.price_trend_30d as change,
              cs.grade_key,
              cs.variant_id
            FROM card_comp_snapshots cs
            JOIN card_variants cv ON cs.variant_id = cv.id
            JOIN cards c ON cv.card_id = c.id
            JOIN players p ON c.player_id = p.id
            WHERE cs.price_trend_30d IS NOT NULL 
              AND abs(cs.price_trend_30d) >= 15
              AND EXISTS (
                SELECT 1 FROM inventory i 
                WHERE i.variant_id = cs.variant_id 
                  AND i.grade_key = cs.grade_key 
                  AND i.listing_status IN ('unlisted', 'listed')
              )
            ORDER BY abs(cs.price_trend_30d) DESC
            LIMIT 10
          `);

          const items = candidates.rows as any[];
          logger.info(`[WORKER] Found ${items.length} cards matching trend threshold for AI Insights.`);

          // Dynamically import Notification and Sportradar modules
          const { NotificationRepository } = await import("./modules/notification/notification.repository.js");
          const { sportradarNewsService } = await import("./modules/ai-narrative/sportradar.service.js");
          const notifRepository = new NotificationRepository();

          // Sync news for unique sports present in candidate items (Delta sync)
          const uniqueSports = Array.from(new Set(items.map((i) => i.sport || "nfl")));
          for (const sp of uniqueSports) {
            try {
              await sportradarNewsService.syncNewsForSport(sp);
            } catch (syncErr: any) {
              logger.warn(`[WORKER] Failed news sync for ${sp}: ${syncErr.message}`);
            }
          }

          let generatedCount = 0;
          for (const item of items) {
            // Check if player already has a narrative in the last 24 hours
            const existing = await db.execute(sql`
              SELECT id FROM narratives 
              WHERE player_name = ${item.player_name} 
                AND created_at > now() - interval '24 hours'
              LIMIT 1
            `);

            if (existing.rows.length > 0) {
              logger.info(`[WORKER] Narrative for ${item.player_name} already generated in the last 24h. Skipping.`);
              continue;
            }

            // Calculate price range
            const currentPrice = Number(item.price);
            const changePct = Number(item.change);
            const oldPrice = currentPrice / (1 + (changePct / 100));
            const priceRange = changePct >= 0 
              ? `$${oldPrice.toFixed(0)} → $${currentPrice.toFixed(0)}`
              : `$${oldPrice.toFixed(0)} → $${currentPrice.toFixed(0)}`; // e.g. "$100 -> $80" if changePct negative

            // Fetch recent news articles for this player
            const recentArticles = await sportradarNewsService.getNewsForPlayer(item.player_name, item.sport, 5);
            const newsPromptBlock = sportradarNewsService.formatNewsForPrompt(recentArticles);

            const prompt = `
You are an expert sports card market analyst. Analyze the following sports card pricing data alongside real-world news events:
Player: ${item.player_name}
Sport: ${item.sport}
Card: ${item.year} ${item.set_name} (${item.variant_name}) Grade: ${item.grade_key}
Current Comp Price: $${currentPrice.toFixed(2)}
30-Day Price Trend: ${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%
Price Range: ${priceRange}

Recent Real-World News & Events (Sportradar AP News):
${newsPromptBlock}

Based on this trend and the real-world news events above, write a market insight. Explain the exact catalyst (injury, trade, playoff performance, award, or market overreaction) driving this price shift.
Ensure your response is valid JSON matching this schema:
{
  "headline": "A short, punchy headline (e.g., 'Daniels rookies surge 18% after record game')",
  "shortSummary": "A single sentence summary outlining what dealers should do (max 150 chars)",
  "body": "A detailed explanation of the card's momentum, citing real-world news events if applicable and explaining why the price shifted.",
  "recommendation": "BUY" | "SELL" | "HOLD" | "PRICE ADJUST",
  "narrativeType": "breakout" | "injury" | "hype" | "decline" | "seasonal" | "trade" | "hof" | "award" | "auction_record"
}
Output ONLY the JSON object, do not add markdown block wrappers like \`\`\`json.
`;

            try {
              const res = await vertexAiClient.generateFromText(prompt, "gemini-3.1-flash-lite");
              const cleaned = res.replace(/```json|```/g, "").replace(/`/g, "").trim();
              const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
              const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
              
              const correlatedEventsJson = recentArticles.length > 0
                ? JSON.stringify(recentArticles.map(a => ({ event: a.title, publishedAt: a.published_at, isInjury: a.is_injury, isTransaction: a.is_transaction })))
                : null;

              // Insert narrative into DB
              const [inserted] = await db.insert(narratives).values({
                playerName: item.player_name,
                sport: item.sport,
                cardIds: [item.card_id],
                headline: parsed.headline,
                shortSummary: parsed.shortSummary,
                body: parsed.body,
                narrativeType: parsed.narrativeType,
                priceChangePct: changePct.toFixed(2),
                priceDirection: changePct >= 0 ? "up" : "down",
                priceRange: priceRange,
                recommendation: parsed.recommendation,
                correlatedEvents: correlatedEventsJson,
                status: "published", // Automatically publish cron insights
                publishedAt: new Date()
              }).returning();

              logger.info(`[WORKER] Successfully generated AI Insight for ${item.player_name}. Finding owners to notify...`);

              // Find users who own this card variant in active inventory
              const ownersResult = await db.execute(sql`
                SELECT DISTINCT user_id FROM inventory
                WHERE variant_id = ${item.variant_id} AND listing_status IN ('unlisted', 'listed')
              `);
              
              const owners = ownersResult.rows as any[];
              for (const owner of owners) {
                await notifRepository.sendNotification(
                  owner.user_id,
                  `AI Insight: ${parsed.headline}`,
                  parsed.shortSummary,
                  "ai_narrative",
                  { screen: "ai-insights", id: inserted.id }
                );
              }

              generatedCount++;

              // Wait 2 seconds between calls to avoid API rate limit
              await delay(2000);
            } catch (err: any) {
              logger.error(`[WORKER] Failed to generate/insert narrative for ${item.player_name}: ${err.message}`);
            }
          }

          return { success: true, generated: generatedCount };
        } catch (error: any) {
          logger.error(`[WORKER] Failed to process generate_ai_insights: ${error.message}`);
          throw error;
        }
      }

      // -------------------------------------------------------------
      // NEW BATCH JOBS
      // -------------------------------------------------------------
      else if (job.name === "process_batch_upload" || job.name === "process_multi_scan") {
        const { batchId, userId } = job.data;
        logger.info(`[WORKER] Processing batch job ${batchId} for user ${userId} (${job.name})`);

        try {
          await db.update(batchJobs).set({ status: "processing", updatedAt: new Date() }).where(eq(batchJobs.id, batchId));
          const [batchRecord] = await db.select().from(batchJobs).where(eq(batchJobs.id, batchId));

          if (userId) {
            await sseService.publish(userId, { type: "batch_status", batchId, status: "processing", message: "Task is in progress..." });
          }

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
          
          let uploadedImageUrl: string | null = null;
          if (batchRecord.imageBase64 && env.S3_BUCKET_NAME) {
            try {
              const buffer = Buffer.from(batchRecord.imageBase64, "base64");
              const key = `cards/${userId || "batch"}/batch-${batchId}/${randomUUID()}.jpg`;
              const client = new S3Client({
                region: env.AWS_REGION || "us-east-1",
                credentials: {
                  accessKeyId: env.AWS_ACCESS_KEY_ID || "",
                  secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
                },
              });
              await client.send(
                new PutObjectCommand({
                  Bucket: env.S3_BUCKET_NAME,
                  Key: key,
                  Body: buffer,
                  ContentType: "image/jpeg",
                })
              );
              uploadedImageUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
              logger.info(`[WORKER] Uploaded batch image to S3: ${uploadedImageUrl}`);
            } catch (s3Err: any) {
              logger.error(`[WORKER] Failed to upload batch image to S3: ${s3Err.message}`);
            }
          }

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
          
          if (userId) {
            await sseService.publish(userId, { type: "batch_status", batchId, status: "progress", message: `Extracted ${cards.length} cards, pre-fetching comps...` });
          }

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
              comps: compsData,
              uploadedImageUrl: uploadedImageUrl
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
          
          if (userId) {
            const notifRepo = new NotificationRepository();
            const notifService = new NotificationService(notifRepo);
            await notifService.sendNotification(userId, "Upload Complete", `Successfully processed ${cards.length} cards.`, "system", { batchId });
            await sseService.publish(userId, { type: "batch_status", batchId, status: "completed", message: "Task completed successfully" });
          }
          
          return { success: true, count: cards.length };

        } catch (error: any) {
          logger.error(`[WORKER] Failed batch job ${batchId}: ${error.message}`);
          await db.update(batchJobs).set({ 
            status: "failed", 
            error: error.message,
            updatedAt: new Date() 
          }).where(eq(batchJobs.id, batchId));
          
          if (userId) {
            const notifRepo = new NotificationRepository();
            const notifService = new NotificationService(notifRepo);
            await notifService.sendNotification(userId, "Upload Failed", `Task failed: ${error.message}`, "system", { batchId });
            await sseService.publish(userId, { type: "batch_status", batchId, status: "failed", message: error.message });
          }
          
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
