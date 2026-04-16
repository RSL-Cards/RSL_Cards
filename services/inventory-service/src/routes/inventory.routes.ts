import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { InventoryRepository } from "../repositories/inventory.repository.js";
import { InventoryService } from "../services/inventory.service.js";
import { InventoryController } from "../controllers/inventory.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";

export async function inventoryRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const inventoryRepository = new InventoryRepository(env);
  const inventoryService = new InventoryService(inventoryRepository);
  const inventoryController = new InventoryController(inventoryService);

  // Global internal security check
  app.addHook("preHandler", internalAuthPreHandler);

  // Health/Ping
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
      service: "inventory-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      bullmq_worker: "running",
      timestamp: new Date().toISOString(),
    });
  });

  // Standard CRUD & Operations (prefixed with /v1/inventory in registerRoutes)
  app.get("/", inventoryController.listInventory);
  app.get("/summary", inventoryController.getInventorySummary);
  app.get("/aging-alerts", inventoryController.getInventoryAgingAlerts);
  app.get("/:id", inventoryController.getItem);
  app.post("/", inventoryController.addItem);
  app.patch("/:id", inventoryController.updateItem);
  app.delete("/:id", inventoryController.deleteItem);

  app.post("/revalue", inventoryController.revalueInventory);
  app.post("/:id/photos", inventoryController.uploadPhotos);
  app.delete("/:id/photos/:photoIndex", inventoryController.deletePhoto);

  app.post("/bulk-import", inventoryController.bulkImport);
  app.get("/bulk-import/:jobId", inventoryController.getBulkImportStatus);

  app.get("/export", inventoryController.exportInventory);
  app.get("/public/:dealerId", inventoryController.getPublicInventory);
}
