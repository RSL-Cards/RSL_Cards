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

  app.get("/v1/inventory", controller.getInventory);
  app.get("/v1/inventory/summary", controller.getInventorySummary);
  app.get("/v1/inventory/aging-alerts", controller.getInventoryAgingAlerts);
  app.get("/v1/inventory/:id", controller.getInventoryId);
  app.post("/v1/inventory", controller.postInventory);
  app.patch("/v1/inventory/:id", controller.patchInventoryId);
  app.delete("/v1/inventory/:id", controller.deleteInventoryId);
  app.post("/v1/inventory/revalue", controller.postInventoryRevalue);
  app.post("/v1/inventory/:id/photos", controller.postInventoryIdPhotos);
  app.delete(
    "/v1/inventory/:id/photos/:photoIndex",
    controller.deleteInventoryIdPhotosPhotoindex,
  );
  app.post("/v1/inventory/bulk-import", controller.postInventoryBulkImport);
  app.get(
    "/v1/inventory/bulk-import/:jobId",
    controller.getInventoryBulkImportJobid,
  );
  app.get("/v1/inventory/export", controller.getInventoryExport);
  app.get(
    "/v1/inventory/public/:dealerId",
    controller.getInventoryPublicDealerid,
  );
}
