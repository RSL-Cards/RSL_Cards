import { InventoryRepository } from "./inventory.repository.js";
import { redisAdapter } from "../../adapters/redis.adapter.js";

export class InventoryService {
  constructor(
    private readonly repository: InventoryRepository
  ) {}

  private async invalidateSummaryCache(userId: string) {
    const cacheKey = `cache:inventory_summary:${userId}`;
    try {
      await redisAdapter.delete(cacheKey);
    } catch (err: any) {
      console.warn(`[INVENTORY] Redis cache delete failed: ${err.message}`);
    }
  }

  async getInventory(query: any, userId: string) {
    return this.repository.getInventory(query, userId);
  }

  async getInventorySummary(userId: string) {
    const cacheKey = `cache:inventory_summary:${userId}`;
    try {
      const cached = await redisAdapter.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err: any) {
      console.warn(`[INVENTORY] Redis cache get failed: ${err.message}`);
    }

    const summary = await this.repository.getInventorySummary(userId);

    try {
      await redisAdapter.set(cacheKey, JSON.stringify(summary), 300); // 5 min TTL
    } catch (err: any) {
      console.warn(`[INVENTORY] Redis cache set failed: ${err.message}`);
    }

    return summary;
  }

  async getInventoryAgingAlerts(userId: string) {
    return this.repository.getInventoryAgingAlerts(userId);
  }

  async getInventoryId(id: string, userId: string) {
    return this.repository.getInventoryId(id, userId);
  }

  async postInventory(body: any, userId: string) {
    await this.invalidateSummaryCache(userId);
    return this.repository.postInventory(body, userId);
  }

  async patchInventoryId(id: string, body: any, userId: string) {
    await this.invalidateSummaryCache(userId);
    return this.repository.patchInventoryId(id, body, userId);
  }

  async deleteInventoryId(id: string, userId: string) {
    await this.invalidateSummaryCache(userId);
    return this.repository.deleteInventoryId(id, userId);
  }

  async postInventoryRevalue(userId: string) {
    await this.invalidateSummaryCache(userId);
    return this.repository.postInventoryRevalue(userId);
  }

  async postInventoryBulkImport(userId: string, body: any) {
    return this.repository.postInventoryBulkImport(userId, body);
  }

  async getInventoryBulkImportJobId(jobId: string) {
    return this.repository.getInventoryBulkImportJobId(jobId);
  }

  async getInventoryExport(userId: string, query?: any) {
    return this.repository.getInventoryExport(userId, query);
  }

  async getInventoryPublicDealerId(dealerId: string) {
    return this.repository.getInventoryPublicDealerId(dealerId);
  }

  async presignPhotoUpload(inventoryId: string, contentType: string, fileName: string | undefined, userId: string) {
    // Verify item ownership
    const item = await this.repository.getInventoryId(inventoryId, userId);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    const { env } = await import("../../config/index.js");
    if (!env.S3_BUCKET_NAME) {
      throw new Error("S3 not configured");
    }

    const ext = contentType === "image/png" ? "png" : "jpg";
    const key = `cardimages/${userId}/${inventoryId}/${fileName ?? `photo-${Date.now()}.${ext}`}`;

    const { S3Service } = await import("./s3.service.js");
    const s3 = new S3Service(env);
    const uploadUrl = await s3.getPresignedUploadUrl(key, contentType);
    const publicUrl = s3.publicUrl(key);

    return { uploadUrl, publicUrl, key };
  }

  async confirmPhotoAdded(inventoryId: string, url: string, userId: string) {
    return this.repository.confirmPhotoAdded(inventoryId, url, userId);
  }

  async deletePhoto(inventoryId: string, photoIndex: number, userId: string) {
    const result = await this.repository.deletePhoto(inventoryId, photoIndex, userId);
    const { urlToDelete } = result;

    if (urlToDelete) {
      const { env } = await import("../../config/index.js");
      if (env.S3_BUCKET_NAME) {
        try {
          const key = new URL(urlToDelete).pathname.slice(1);
          const { S3Service } = await import("./s3.service.js");
          const s3 = new S3Service(env);
          await s3.deleteObject(key);
        } catch (s3Err) {
          console.error("Failed to delete photo from S3 (non-fatal):", s3Err);
        }
      }
    }

    return { success: true };
  }
}
