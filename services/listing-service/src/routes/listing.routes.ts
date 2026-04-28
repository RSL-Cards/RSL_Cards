import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { ListingRepository } from "../repositories/listing.repository.js";
import { ListingService } from "../services/listing.service.js";
import { EbayService } from "../services/ebay.service.js";
import { ListingController } from "../controllers/listing.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { priceRefreshQueue } from "../config/queue.js";

export async function listingRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const listingRepository = new ListingRepository(env);
  const listingService = new ListingService(listingRepository);
  const ebayService = new EbayService(env);
  const listingController = new ListingController(listingService);

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
    return reply.send({
      service: "listing-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      deactivation_worker: "running",
      timestamp: new Date().toISOString(),
    });
  });

  // Standard CRUD & Ops
  app.get("/", listingController.getListings);
  app.post("/", listingController.createListing);
  app.get("/analytics", listingController.getAnalytics);
  app.get("/fee-calculator", listingController.feeCalculator);
  app.post("/generate-content", listingController.generateContent);
  app.get(
    "/price-comparison/:inventoryId",
    listingController.getPriceComparison,
  );

  app.get("/:id", listingController.getListing);
  app.patch("/:id/price", listingController.updatePrice);
  app.post("/:id/relist", listingController.relist);
  app.delete("/:id", listingController.deleteListing);

  // Webhooks
  app.post("/webhooks/ebay", listingController.ebayWebhook);
  app.post("/webhooks/whatnot", listingController.whatnotWebhook);
  app.post("/webhooks/mercari", listingController.mercariWebhook);
  app.post("/webhooks/tcgplayer", listingController.tcgplayerWebhook);
  app.post("/webhooks/shopify", listingController.shopifyWebhook);

  // eBay Browse API
  app.get(
    "/ebay/search",
    {
      schema: {
        tags: ["eBay"],
        summary: "Search active eBay listings",
        querystring: {
          type: "object",
          required: ["q"],
          properties: {
            q: { type: "string", description: "Search keyword" },
            limit: { type: "string", description: "Max results (default 20)" },
            offset: {
              type: "string",
              description: "Pagination offset (default 0)",
            },
            sort: { type: "string", description: "Sort order" },
            filter: { type: "string", description: "eBay filter string" },
          },
        },
      },
    },
    async (req: any, reply) => {
      const { q, limit, offset, sort, filter } = req.query as Record<
        string,
        string
      >;
      if (!q?.trim()) {
        return reply
          .status(400)
          .send({ error: "Query parameter 'q' is required" });
      }
      const result = await ebayService.searchListings({
        q: q.trim(),
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0,
        sort,
        filter,
      });
      return reply.send(result);
    },
  );

  app.get(
    "/ebay/sold",
    {
      schema: {
        tags: ["eBay"],
        summary:
          "Sold items — served from DB cache first, refreshed in background",
        querystring: {
          type: "object",
          required: ["q"],
          properties: {
            q: { type: "string", description: "Search keyword" },
            limit: { type: "string", description: "Max results (default 20)" },
            variant_id: {
              type: "string",
              description: "Card variant UUID (for DB upsert)",
            },
            grade_key: {
              type: "string",
              description: "Grade key e.g. PSA_10 (for DB upsert)",
            },
          },
        },
      },
    },
    async (req: any, reply) => {
      const { q, limit, variant_id, grade_key } = req.query as Record<
        string,
        string
      >;
      if (!q?.trim()) {
        return reply
          .status(400)
          .send({ error: "Query parameter 'q' is required" });
      }

      const db = getDb(env);
      const maxResults = limit ? Number(limit) : 20;
      const query = q.trim();
      const gradeKey = grade_key?.trim() || "RAW";

      // ── 1. Serve from DB cache first ──────────────────────────────────────
      if (variant_id?.trim()) {
        const cached = await db.execute(sql`
          SELECT
            avg_sold_price, last_sold_price, lowest_active,
            sales_count_30d, price_trend_30d, fetched_at, platform
          FROM card_comp_snapshots
          WHERE variant_id = ${variant_id.trim()}
            AND grade_key = ${gradeKey}
          ORDER BY fetched_at DESC
          LIMIT 10
        `);

        if (cached.rows.length > 0) {
          const rows = cached.rows as any[];
          // Return DB rows immediately, then refresh in background
          reply.send({
            query,
            fromCache: true,
            fetchedAt: rows[0].fetched_at,
            snapshots: rows.map((r) => ({
              platform: r.platform,
              avgSoldPrice: r.avg_sold_price,
              lastSoldPrice: r.last_sold_price,
              lowestActive: r.lowest_active,
              salesCount30d: r.sales_count_30d,
              priceTrend30d: r.price_trend_30d,
            })),
          });

          // Background refresh if data is older than 15 minutes
          const ageMs = Date.now() - new Date(rows[0].fetched_at).getTime();
          if (ageMs < 15 * 60 * 1000) return;

          // Fire-and-forget background eBay fetch + upsert
          ebayService
            .getSoldItems({ q: query, days: 30, limit: maxResults })
            .then(async (fresh) => {
              if (!fresh.items.length) return;
              const prices = fresh.items
                .map((i: any) => parseFloat(i.soldPrice?.value ?? "0"))
                .filter((p: number) => p > 0);
              if (!prices.length) return;
              const avg =
                prices.reduce((a: number, b: number) => a + b, 0) /
                prices.length;
              const last = prices[0];
              const lowest = Math.min(...prices);
              await db.execute(sql`
                INSERT INTO card_comp_snapshots
                  (id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at)
                VALUES
                  (gen_random_uuid(), ${variant_id.trim()}, ${gradeKey}, 'ebay', ${avg.toFixed(2)}, ${last.toFixed(2)}, ${lowest.toFixed(2)}, ${prices.length}, NOW())
                ON CONFLICT (variant_id, grade_key, platform)
                DO UPDATE SET
                  avg_sold_price = EXCLUDED.avg_sold_price,
                  last_sold_price = EXCLUDED.last_sold_price,
                  lowest_active = EXCLUDED.lowest_active,
                  sales_count_30d = EXCLUDED.sales_count_30d,
                  fetched_at = NOW()
              `);
            })
            .catch(() => {});
          return;
        }
      }

      // ── 2. No cache — fetch live from eBay, persist, return ───────────────
      const [last7, last30] = await Promise.all([
        ebayService.getSoldItems({ q: query, days: 7, limit: maxResults }),
        ebayService.getSoldItems({ q: query, days: 30, limit: maxResults }),
      ]);

      // Persist snapshot if variant_id provided
      if (variant_id?.trim()) {
        const prices = last30.items
          .map((i: any) => parseFloat(i.soldPrice?.value ?? "0"))
          .filter((p: number) => p > 0);
        if (prices.length > 0) {
          const avg =
            prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
          const last = prices[0];
          const lowest = Math.min(...prices);
          db.execute(
            sql`
            INSERT INTO card_comp_snapshots
              (id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at)
            VALUES
              (gen_random_uuid(), ${variant_id.trim()}, ${gradeKey}, 'ebay', ${avg.toFixed(2)}, ${last.toFixed(2)}, ${lowest.toFixed(2)}, ${prices.length}, NOW())
            ON CONFLICT (variant_id, grade_key, platform)
            DO UPDATE SET
              avg_sold_price = EXCLUDED.avg_sold_price,
              last_sold_price = EXCLUDED.last_sold_price,
              lowest_active = EXCLUDED.lowest_active,
              sales_count_30d = EXCLUDED.sales_count_30d,
              fetched_at = NOW()
          `,
          ).catch(() => {});
        }
      }

      return reply.send({
        query,
        fromCache: false,
        last7Days: last7,
        last30Days: last30,
      });
    },
  );

  app.get(
    "/ebay/items/by-name",
    {
      schema: {
        tags: ["eBay"],
        summary: "Full item detail by search name (returns first match)",
        querystring: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Product name to search" },
          },
        },
      },
    },
    async (req: any, reply) => {
      const { name } = req.query as { name?: string };
      if (!name?.trim()) {
        return reply
          .status(400)
          .send({ error: "Query parameter 'name' is required" });
      }
      const result = await ebayService.getItemDetailsByName(name.trim());
      return reply.send(result);
    },
  );

  app.get(
    "/ebay/items/:itemId",
    {
      schema: {
        tags: ["eBay"],
        summary: "Full item detail by eBay item ID",
        params: {
          type: "object",
          properties: {
            itemId: {
              type: "string",
              description: "eBay item ID (e.g. v1|110589351995|0)",
            },
          },
        },
      },
    },
    async (req: any, reply) => {
      const { itemId } = req.params as { itemId: string };
      const result = await ebayService.getItemDetails(itemId);
      return reply.send(result);
    },
  );

  // Price history for a card — read from card_price_history table
  app.get(
    "/price-history/:cardId",
    {
      schema: {
        tags: ["Prices"],
        summary: "Get eBay price history for a card (last 90 days)",
        params: {
          type: "object",
          properties: { cardId: { type: "string" } },
        },
        querystring: {
          type: "object",
          properties: { grade_key: { type: "string" } },
        },
      },
    },
    async (req: any, reply) => {
      const { cardId } = req.params as { cardId: string };
      const gradeKey = (req.query as any).grade_key ?? "RAW";
      const db = getDb(env);

      const rows = await db.execute(sql`
        SELECT
          ph.recorded_date,
          ph.avg_sold_price,
          ph.min_sold_price,
          ph.max_sold_price,
          ph.sales_count,
          ph.grade_key
        FROM card_price_history ph
        JOIN card_variants cv ON cv.id = ph.variant_id
        WHERE cv.card_id = ${cardId}
          AND ph.grade_key = ${gradeKey}
          AND ph.recorded_date >= NOW() - INTERVAL '90 days'
        ORDER BY ph.recorded_date ASC
        LIMIT 180
      `);

      return reply.send({
        cardId,
        gradeKey,
        history: (rows.rows as any[]).map((r) => ({
          date: r.recorded_date,
          avg: parseFloat(r.avg_sold_price ?? "0"),
          min: parseFloat(r.min_sold_price ?? "0"),
          max: parseFloat(r.max_sold_price ?? "0"),
          salesCount: Number(r.sales_count ?? 0),
        })),
      });
    },
  );

  // Manual trigger — kick off a price refresh immediately
  app.post(
    "/price-refresh/trigger",
    {
      schema: {
        tags: ["Prices"],
        summary:
          "Manually trigger an immediate eBay price refresh for all inventory",
      },
    },
    async (_req, reply) => {
      const q = priceRefreshQueue;
      if (!q) return reply.status(503).send({ error: "queue not ready" });
      const job = await q.add("refresh-all-manual", {});
      return reply.send({ triggered: true, jobId: String(job.id) });
    },
  );
}
