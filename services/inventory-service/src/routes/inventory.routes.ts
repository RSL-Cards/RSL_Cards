import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { InventoryRepository } from "../repositories/inventory.repository.js";
import { InventoryService } from "../services/inventory.service.js";
import { InventoryController } from "../controllers/inventory.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { S3Service } from "../services/s3.service.js";

function getUserId(req: any): string {
  return req.headers["x-user-id"] as string;
}

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

  app.post("/:id/photos", async (req: any, reply) => {
    const userId = getUserId(req);
    const inventoryId = req.params.id as string;
    const { contentType = "image/jpeg", fileName } = req.body as any;

    if (!env.S3_BUCKET_NAME) {
      return reply.status(503).send({ error: "S3 not configured" });
    }

    const db = getDb(env);
    const check = await db.execute(sql`
      SELECT id FROM inventory WHERE id = ${inventoryId} AND user_id = ${userId} LIMIT 1
    `);
    if (check.rows.length === 0) {
      return reply.status(404).send({ error: "Inventory item not found" });
    }

    const ext = contentType === "image/png" ? "png" : "jpg";
    const key = `cards/${userId}/${inventoryId}/${fileName ?? `photo-${Date.now()}.${ext}`}`;

    const s3 = new S3Service(env as any);
    const uploadUrl = await s3.getPresignedUploadUrl(key, contentType);
    const publicUrl = s3.publicUrl(key);

    return reply.send({ uploadUrl, publicUrl, key });
  });

  app.post("/:id/photos/confirm", async (req: any, reply) => {
    const userId = getUserId(req);
    const inventoryId = req.params.id as string;
    const { url } = req.body as any;

    if (!url) return reply.status(400).send({ error: "url is required" });

    const db = getDb(env);
    await db.execute(sql`
      UPDATE inventory
      SET photos = array_append(COALESCE(photos, ARRAY[]::text[]), ${url}),
          updated_at = NOW()
      WHERE id = ${inventoryId} AND user_id = ${userId}
    `);

    return reply.send({ success: true });
  });

  app.delete("/:id/photos/:photoIndex", async (req: any, reply) => {
    const userId = getUserId(req);
    const inventoryId = req.params.id as string;
    const photoIndex = Number(req.params.photoIndex);

    const db = getDb(env);
    const item = await db.execute(sql`
      SELECT photos FROM inventory WHERE id = ${inventoryId} AND user_id = ${userId} LIMIT 1
    `);
    if (item.rows.length === 0)
      return reply.status(404).send({ error: "Not found" });

    const photos: string[] = (item.rows[0] as any).photos ?? [];
    const urlToDelete = photos[photoIndex];

    if (urlToDelete && env.S3_BUCKET_NAME) {
      try {
        const key = new URL(urlToDelete).pathname.slice(1);
        const s3 = new S3Service(env as any);
        await s3.deleteObject(key);
      } catch {}
    }

    const updated = photos.filter((_, i) => i !== photoIndex);
    await db.execute(sql`
      UPDATE inventory
      SET photos = ${updated.length > 0 ? updated : null}::text[],
          updated_at = NOW()
      WHERE id = ${inventoryId} AND user_id = ${userId}
    `);

    return reply.send({ success: true });
  });

  app.post("/bulk-import", inventoryController.bulkImport);
  app.get("/bulk-import/:jobId", inventoryController.getBulkImportStatus);

  app.get("/export", inventoryController.exportInventory);
  app.get("/public/:dealerId", inventoryController.getPublicInventory);
}
