import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { CardDbRepository } from "../repositories/card-db.repository.js";
import { CardDbService } from "../services/card-db.service.js";
import { CardDbController } from "../controllers/card-db.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";

export async function cardsRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const cardDbRepository = new CardDbRepository(env);
  const cardDbService = new CardDbService(cardDbRepository);
  const cardDbController = new CardDbController(cardDbService);

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
    const ximilar_configured = Boolean(
      env.XIMILAR_API_KEY && env.XIMILAR_API_KEY.length > 0,
    );
    return reply.send({
      service: "card-db-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      cache_enabled: true,
      ximilar_configured,
      timestamp: new Date().toISOString(),
    });
  });

  // Standard CRUD & Ops
  app.post("/scan", cardDbController.scanCard);
  app.post("/scan-barcode", cardDbController.scanBarcode);
  app.get("/search", cardDbController.searchCards);
  app.get("/offline-db", cardDbController.getOfflineDb);
  app.get("/deal-rating", cardDbController.getDealRating);

  app.get("/price-alerts", cardDbController.getPriceAlerts);
  app.post("/price-alerts", cardDbController.postPriceAlert);
  app.delete("/price-alerts/:id", cardDbController.deletePriceAlert);

  app.get("/want-list", cardDbController.getWantList);
  app.post("/want-list", cardDbController.postWantList);
  app.delete("/want-list/:id", cardDbController.deleteWantList);

  app.get("/:id", cardDbController.getCard);
  app.get("/:id/comps", cardDbController.getComps);
  app.get("/:id/price-history", cardDbController.getPriceHistory);
}
