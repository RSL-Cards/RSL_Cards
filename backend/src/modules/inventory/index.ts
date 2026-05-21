import { Elysia } from "elysia";
import { InventoryRepository } from "./inventory.repository.js";
import { InventoryService } from "./inventory.service.js";
import { InventoryController } from "./inventory.controller.js";
import { env } from "../../config/index.js";
import { requireDealer } from "../../middleware/auth.js";

const repository = new InventoryRepository();
const service = new InventoryService(repository);
const controller = new InventoryController(service);

export const inventoryModule = new Elysia({ prefix: "/v1/inventory" })
  .get("/public/:dealerId", controller.getPublicInventory)
  .use(requireDealer)
  .get("/", controller.listInventory)
  .get("/summary", controller.getInventorySummary)
  .get("/aging-alerts", controller.getInventoryAgingAlerts)
  .get("/:id", controller.getItem)
  .post("/", controller.addItem)
  .patch("/:id", controller.updateItem)
  .delete("/:id", controller.deleteItem)
  .post("/:id/photos", controller.uploadPhotos)
  .post("/:id/photos/confirm", controller.confirmPhotos)
  .delete("/:id/photos/:photoIndex", controller.deletePhoto)
  .post("/revalue", controller.revalueInventory)
  .post("/bulk-import", controller.bulkImport)
  .get("/bulk-import/:jobId", controller.getBulkImportStatus)
  .get("/export", controller.exportInventory);
