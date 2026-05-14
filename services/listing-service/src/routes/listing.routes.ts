import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { ListingRepository } from "../repositories/listing.repository.js";
import { ListingService } from "../services/listing.service.js";
import { EbayService } from "../services/ebay.service.js";
import { SoldCompsService } from "../services/sold-comps.service.js";
import { ListingController } from "../controllers/listing.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { priceRefreshQueue } from "../config/queue.js";
import { createHash } from "node:crypto";

export async function listingRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const listingRepository = new ListingRepository(env);
  const listingService = new ListingService(listingRepository);
  const ebayService = new EbayService(env);
  const soldCompsService = new SoldCompsService(env);
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
      let effectiveVariantId = variant_id?.trim();

      // If variant_id is missing, try to find it by name/grade (fallback for old inventory items)
      if (!effectiveVariantId && q) {
        const found = await db.execute(sql`
          SELECT cv.id 
          FROM card_variants cv
          JOIN cards c ON c.id = cv.card_id
          WHERE (c.player_name || ' ' || c.year || ' ' || c.set_name || ' ' || COALESCE(cv.name, 'Base')) ILIKE ${'%' + q.trim() + '%'}
          LIMIT 1
        `);
        if (found.rows.length > 0) {
          effectiveVariantId = (found.rows[0] as any).id;
          req.log.info({ effectiveVariantId }, "Fallback variant lookup successful");
        }
      }

      if (effectiveVariantId) {
        const cached = await db.execute(sql`
          SELECT
            id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at
          FROM card_comp_snapshots
          WHERE variant_id = ${effectiveVariantId}
            AND grade_key = ${gradeKey}
          ORDER BY fetched_at DESC
          LIMIT 10
        `);

        if (cached.rows.length > 0) {
          const rows = cached.rows as any[];
          req.log.info({ variant_id: effectiveVariantId }, "[DB_CACHE] Serving price snapshots from database");

          // Fetch individual sold items from cache
          const soldCached = await db.execute(sql`
            SELECT
              platform_item_id, sold_price, sold_at, title, condition
            FROM platform_sold_listings
            WHERE variant_id = ${effectiveVariantId}
              AND grade_key = ${gradeKey}
            ORDER BY sold_at DESC
            LIMIT 20
          `);

          const mappedSold = (soldCached.rows as any[]).map((item) => ({
            itemId: item.platform_item_id,
            title: item.title,
            soldPrice: { value: item.sold_price, currency: "USD" },
            condition: item.condition || "Used",
            endDate: item.sold_at,
            shippingCost: "0.00",
            itemWebUrl: `https://www.ebay.com/itm/${item.platform_item_id}`,
          }));

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
            last7Days: {
              items: mappedSold.slice(0, Math.min(maxResults, 10)),
              totalEntries: mappedSold.length,
              period: "7d",
            },
            last30Days: {
              items: mappedSold,
              totalEntries: mappedSold.length,
              period: "30d",
            },
          });

          // Background refresh if data is older than 15 minutes
          const ageMs = Date.now() - new Date(rows[0].fetched_at).getTime();
          if (ageMs < 15 * 60 * 1000) return;

          // Fire-and-forget background refresh
          (async () => {
            try {
              // 1. Get sold items from SoldComps
              const soldData = await soldCompsService.getSoldItems(query);
              const prices = soldData.items
                .map((i) => parseFloat(i.soldPrice))
                .filter((p) => p > 0);

              // 2. Get active items from eBay (for lowest active)
              const activeData = await ebayService.searchListings({
                q: query,
                limit: Math.min(maxResults, 20),
                sort: "pricePlusShippingLowest",
              });
              const activePrices = (activeData.itemSummaries ?? [])
                .map((i) => parseFloat(i.price?.value ?? "0"))
                .filter((p) => p > 0);

              if (!prices.length && !activePrices.length) return;

              const avg = prices.length
                ? prices.reduce((a, b) => a + b, 0) / prices.length
                : 0;
              const last = prices.length ? prices[0] : 0;
              const lowest = activePrices.length ? activePrices[0] : 0;

              // 3. Upsert snapshot
              req.log.info({ variant_id: effectiveVariantId, gradeKey }, "Upserting price snapshot to database");
              await db.execute(sql`
                INSERT INTO card_comp_snapshots
                  (id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at)
                VALUES
                  (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'ebay', ${avg.toFixed(2)}, ${last.toFixed(2)}, ${lowest.toFixed(2)}, ${prices.length}, NOW())
                ON CONFLICT (variant_id, grade_key, platform)
                DO UPDATE SET
                  avg_sold_price = EXCLUDED.avg_sold_price,
                  last_sold_price = EXCLUDED.last_sold_price,
                  lowest_active = EXCLUDED.lowest_active,
                  sales_count_30d = EXCLUDED.sales_count_30d,
                  fetched_at = NOW()
              `);
              req.log.info("Price snapshot upserted successfully");

              // 4. Save individual sold listings
              for (const item of soldData.items) {
                const contentHash = createHash("sha256")
                  .update(`soldcomps:${item.url}:${item.endedAt}`)
                  .digest("hex")
                  .slice(0, 64);

                await db.execute(sql`
                  INSERT INTO platform_sold_listings
                    (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
                  VALUES
                    (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'ebay', ${parseFloat(item.soldPrice)}, ${item.itemId}, ${item.endedAt}, ${item.title}, ${item.itemCondition || "Used"}, ${contentHash}, NOW())
                  ON CONFLICT (content_hash) DO NOTHING
                `);
              }
            } catch (err) {
              req.log.error(err, "Background price refresh failed");
            }
          })();
          return;
        }
      }

      // ── 2. No cache — fetch live and return ──────────────────────────────
      req.log.info({ query }, "[ORIGINAL_API] Fetching live prices from SoldComps & eBay");
      const [soldData, activeData] = await Promise.all([
        soldCompsService.getSoldItems(query),
        ebayService.searchListings({
          q: query,
          limit: Math.min(maxResults, 20),
          sort: "pricePlusShippingLowest",
        }),
      ]);

      const prices = soldData.items
        .map((i) => parseFloat(i.soldPrice))
        .filter((p) => p > 0);
      const activePrices = (activeData.itemSummaries ?? [])
        .map((i) => parseFloat(i.price?.value ?? "0"))
        .filter((p) => p > 0);

      const avg = prices.length
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;
      const last = prices.length ? prices[0] : 0;
      const lowest = activePrices.length ? activePrices[0] : 0;

      // Persist snapshot if variant_id provided
      if (variant_id?.trim()) {
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

        // Save individual sold listings
        for (const item of soldData.items) {
          const contentHash = createHash("sha256")
            .update(`soldcomps:${item.url}:${item.endedAt}`)
            .digest("hex")
            .slice(0, 64);

          await db.execute(sql`
            INSERT INTO platform_sold_listings
              (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
            VALUES
              (gen_random_uuid(), ${variant_id.trim()}, ${gradeKey}, 'ebay', ${parseFloat(item.soldPrice)}, ${item.itemId}, ${item.endedAt}, ${item.title}, ${item.itemCondition || "Used"}, ${contentHash}, NOW())
            ON CONFLICT (content_hash) DO NOTHING
          `);
        }
      }

      const mappedSold = soldData.items.map((item) => ({
        itemId: item.itemId,
        title: item.title,
        soldPrice: { value: item.soldPrice, currency: item.soldCurrency },
        condition: item.itemCondition || "Used",
        endDate: item.endedAt,
        shippingCost: item.shippingPrice || "0.00",
        itemWebUrl: item.url,
      }));

      const snapshot = {
        platform: "ebay",
        avgSoldPrice: avg.toFixed(2),
        lastSoldPrice: last.toFixed(2),
        lowestActive: lowest.toFixed(2),
        salesCount30d: prices.length,
        priceTrend30d: null,
      };

      return reply.send({
        query,
        fromCache: false,
        snapshots: [snapshot],
        last7Days: {
          items: mappedSold.slice(0, Math.min(maxResults, 10)),
          totalEntries: mappedSold.length,
          period: "7d",
        },
        last30Days: {
          items: mappedSold.slice(0, maxResults),
          totalEntries: mappedSold.length,
          period: "30d",
        },
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
