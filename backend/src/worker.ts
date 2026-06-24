import { Worker } from "bullmq";
import { redisAdapter } from "./adapters/redis.adapter.js";
import { logger } from "./lib/logger.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
import { env } from "./config/index.js";
import { ListingRepository } from "./modules/listing/listing.repository.js";
import { EbayService } from "./modules/listing/ebay.service.js";
import { SoldCompsService } from "./modules/listing/sold-comps.service.js";
import { MyslabsService } from "./modules/listing/myslabs.service.js";
import { bullMqAdapter } from "./adapters/bullmq.adapter.js";

const listingRepo = new ListingRepository();
const ebayService = new EbayService(env);
const soldCompsService = new SoldCompsService(env);
const myslabsService = new MyslabsService(env);

export const initWorker = () => {
  logger.info("👷 Starting BullMQ Worker for background tasks...");

  const worker = new Worker(
    "rsl-task-queue",
    async (job) => {
      if (job.name === "refresh_all_comps") {
        logger.info(`[WORKER] Running refresh_all_comps job (ID: ${job.id})`);
        
        try {
          // Fetch all unique variant_id + grade_key combinations from inventory
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
            // Add a 5 second delay between each item's processing to safely respect API rate limits
            delayMs += 5000; 
          }
          
          logger.info(`[WORKER] Completed spawner job. Enqueued ${items.length} individual comp refreshes.`);
          return { success: true, processed: items.length };
        } catch (error: any) {
          logger.error(`[WORKER] Failed to process refresh_all_comps: ${error.message}`);
          throw error;
        }
      } else if (job.name === "refresh_single_comp") {
        const { item } = job.data;
        const query = `${item.player_name} ${item.year || ""} ${item.set_name || ""} ${item.variant_name || ""}`.trim();
        const variant_id = item.variant_id;
        const grade_key = item.grade_key || "RAW";

        logger.info(`[WORKER] Fetching live comps for single item: ${query} (Grade: ${grade_key})`);
        
        try {
          await listingRepo.ebaySold({ q: query, limit: 20, variant_id, grade_key }, ebayService, soldCompsService);
        } catch (err: any) {
          logger.error(`[WORKER] Error fetching eBay comps for ${query}: ${err.message}`);
        }

        try {
          await listingRepo.myslabsSold({ q: query, limit: 20, variant_id, grade_key }, myslabsService);
        } catch (err: any) {
          logger.error(`[WORKER] Error fetching MySlabs comps for ${query}: ${err.message}`);
        }

        return { success: true, processed: variant_id };
      }
    },
    {
      connection: redisAdapter.getClient(),
      concurrency: 1, // Avoid hitting rate limits too hard by running serially
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
