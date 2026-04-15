import { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import * as controller from "../controllers/main.controller.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  // Decorate fastify instance with env so controllers can access it
  app.decorate("env", env);

  // Add hook to attach env to each request
  app.addHook("onRequest", async (request) => {
    (request as any).env = env;
  });

  app.post("/v1/cards/scan", controller.postCardsScan);
  app.post("/v1/cards/scan/barcode", controller.postCardsScanBarcode);
  app.get("/v1/cards/search", controller.getCardsSearch);
  app.get("/v1/cards/:id", controller.getCardsId);
  app.get("/v1/cards/:id/comps", controller.getCardsIdComps);
  app.get("/v1/cards/:id/price-history", controller.getCardsIdPriceHistory);
  app.get("/v1/cards/offline-db", controller.getCardsOfflineDb);
  app.get("/v1/cards/price-alerts", controller.getCardsPriceAlerts);
  app.post("/v1/cards/price-alerts", controller.postCardsPriceAlerts);
  app.delete("/v1/cards/price-alerts/:id", controller.deleteCardsPriceAlertsId);
  app.get("/v1/cards/want-list", controller.getCardsWantList);
  app.post("/v1/cards/want-list", controller.postCardsWantList);
  app.delete("/v1/cards/want-list/:id", controller.deleteCardsWantListId);
  app.get("/v1/cards/deal-rating", controller.getCardsDealRating);
}
