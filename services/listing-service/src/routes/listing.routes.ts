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
  app.get("/ebay/search", async (req: any, reply) => {
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
  });

  app.get("/ebay/sold", async (req: any, reply) => {
    const { q, limit } = req.query as Record<string, string>;
    if (!q?.trim()) {
      return reply
        .status(400)
        .send({ error: "Query parameter 'q' is required" });
    }
    const [last7, last30] = await Promise.all([
      ebayService.getSoldItems({
        q: q.trim(),
        days: 7,
        limit: limit ? Number(limit) : 20,
      }),
      ebayService.getSoldItems({
        q: q.trim(),
        days: 30,
        limit: limit ? Number(limit) : 20,
      }),
    ]);
    return reply.send({
      query: q.trim(),
      last7Days: last7,
      last30Days: last30,
    });
  });

  app.get("/ebay/items/by-name", async (req: any, reply) => {
    const { name } = req.query as { name?: string };
    if (!name?.trim()) {
      return reply
        .status(400)
        .send({ error: "Query parameter 'name' is required" });
    }
    const result = await ebayService.getItemDetailsByName(name.trim());
    return reply.send(result);
  });

  app.get("/ebay/items/:itemId", async (req: any, reply) => {
    const { itemId } = req.params as { itemId: string };
    const result = await ebayService.getItemDetails(itemId);
    return reply.send(result);
  });
}
