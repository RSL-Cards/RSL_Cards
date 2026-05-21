import { Elysia } from "elysia";
import { CardDbRepository } from "./card-db.repository.ts";
import { CardDbService } from "./card-db.service.ts";
import { CardDbController } from "./card-db.controller.ts";
import { requireDealer } from "../../middleware/auth.js";

const repository = new CardDbRepository();
const service = new CardDbService(repository);
const controller = new CardDbController(service);

export const cardDbModule = new Elysia({ prefix: "/v1/cards" })
  .use(requireDealer)
  .post("/scan", controller.scanCard)
  .post("/scan-barcode", controller.scanBarcode)
  .get("/search", controller.searchCards)
  .get("/offline-db", controller.getOfflineDb)
  .get("/deal-rating", controller.getDealRating)
  .get("/price-alerts", controller.getPriceAlerts)
  .post("/price-alerts", controller.postPriceAlert)
  .delete("/price-alerts/:id", controller.deletePriceAlert)
  .get("/want-list", controller.getWantList)
  .post("/want-list", controller.postWantList)
  .delete("/want-list/:id", controller.deleteWantList)
  .get("/:id", controller.getCard)
  .get("/:id/comps", controller.getComps)
  .get("/:id/price-history", controller.getPriceHistory);
