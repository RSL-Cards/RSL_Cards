import { Queue, Worker } from "bullmq";
import type { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { EbayService } from "../services/ebay.service.js";

const QUEUE_NAME = "price-refresh";

export function createPriceRefreshQueue(
  connection: IORedis,
  env: Env,
  logger: FastifyBaseLogger,
): { priceRefreshQueue: Queue; priceRefreshWorker: Worker } {
  const priceRefreshQueue = new Queue(QUEUE_NAME, { connection });

  const priceRefreshWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      logger.info({ jobId: job.id }, "price-refresh job started");
      const db = getDb(env);
      const ebay = new EbayService(env);

      // Fetch all distinct card_id + grade_key from inventory
      const inventoryRows = await db.execute(sql`
        SELECT DISTINCT i.card_id, i.grade_key
        FROM inventory i
        WHERE i.card_id IS NOT NULL
      `);

      if (!inventoryRows.rows.length) {
        logger.info("price-refresh: no inventory rows to process");
        return;
      }

      // Get card names in one query
      const cardIds = [
        ...new Set((inventoryRows.rows as any[]).map((r) => r.card_id)),
      ];

      const cardRows = await db.execute(sql`
        SELECT id, player_name, year, set_name
        FROM cards
        WHERE id = ANY(${cardIds})
      `);

      const cardMap = new Map<string, string>();
      for (const c of cardRows.rows as any[]) {
        const label = [c.year, c.player_name, c.set_name]
          .filter(Boolean)
          .join(" ");
        cardMap.set(c.id, label);
      }

      let refreshed = 0;
      let failed = 0;

      for (const row of inventoryRows.rows as any[]) {
        const cardName = cardMap.get(row.card_id);
        if (!cardName) continue;

        const gradeKey: string = row.grade_key ?? "RAW";
        const query = gradeKey !== "RAW" ? `${cardName} ${gradeKey}` : cardName;

        try {
          const result = await ebay.getSoldItems({
            q: query,
            days: 30,
            limit: 20,
          });

          const prices = result.items
            .map((i: any) => parseFloat(i.soldPrice?.value ?? "0"))
            .filter((p: number) => p > 0);

          if (!prices.length) continue;

          const avg =
            prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
          const lowest = Math.min(...prices);

          // card_comp_snapshots uses variant_id FK — store in card_price_history instead
          // which uses grade_key directly (no variant_id FK required)
          await db.execute(sql`
            INSERT INTO card_price_history
              (id, grade_key, avg_sold_price, min_sold_price, max_sold_price, sales_count, price_trend, recorded_date, variant_id)
            SELECT
              gen_random_uuid(),
              ${gradeKey},
              ${avg.toFixed(2)},
              ${lowest.toFixed(2)},
              ${Math.max(...prices).toFixed(2)},
              ${prices.length},
              NULL,
              NOW(),
              cv.id
            FROM card_variants cv
            WHERE cv.card_id = ${row.card_id}
            LIMIT 1
            ON CONFLICT DO NOTHING
          `);

          refreshed++;
          logger.debug(
            { cardName, gradeKey, avg: avg.toFixed(2) },
            "price refreshed",
          );

          // Rate-limit: 200ms between eBay calls to avoid 429
          await new Promise((r) => setTimeout(r, 200));
        } catch (err: any) {
          failed++;
          logger.warn(
            { cardName, gradeKey, err: err.message },
            "price refresh failed for card",
          );
        }
      }

      logger.info(
        { refreshed, failed, total: inventoryRows.rows.length },
        "price-refresh job complete",
      );
    },
    { connection, concurrency: 1 },
  );

  priceRefreshWorker.on("error", (err) =>
    logger.error({ err }, "price-refresh worker error"),
  );
  priceRefreshWorker.on("active", (job) =>
    logger.info({ jobId: job.id, name: job.name }, "price-refresh job active"),
  );
  priceRefreshWorker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "price-refresh job completed"),
  );
  priceRefreshWorker.on("failed", (job, err) =>
    logger.error(
      { jobId: job?.id, err: err.message },
      "price-refresh job failed",
    ),
  );
  priceRefreshWorker.on("stalled", (jobId) =>
    logger.warn({ jobId }, "price-refresh job stalled"),
  );

  // Schedule every 12 hours
  priceRefreshQueue
    .add(
      "refresh-all",
      {},
      {
        repeat: { pattern: "0 */12 * * *" },
        jobId: "price-refresh-scheduled",
      },
    )
    .catch(() => {});

  return { priceRefreshQueue, priceRefreshWorker };
}
