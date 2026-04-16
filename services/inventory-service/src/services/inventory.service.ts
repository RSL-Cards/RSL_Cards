
import { InventoryRepository } from "../repositories/inventory.repository.js";

export class InventoryService {
  constructor(
    private readonly repository: InventoryRepository
  ) {}

  async getInventory(body: any, params: any, query: any, userId: string) {
    return this.repository.getInventory(body, params, query, userId);
  }

  async getInventorySummary(
    body: any,
    params: any,
    query: any,
    userId: string,
  ) {
    return this.repository.getInventorySummary(body, params, query, userId);
  }

  async getInventoryAgingAlerts(
    body: any,
    params: any,
    query: any,
    userId: string,
  ) {
    return this.repository.getInventoryAgingAlerts(body, params, query, userId);
  }

  async getInventoryId(body: any, params: any, query: any, userId: string) {
    return this.repository.getInventoryId(body, params, query, userId);
  }

  async postInventory(body: any, params: any, query: any, userId: string) {
    return this.repository.postInventory(body, params, query, userId);
  }

  async patchInventoryId(body: any, params: any, query: any) {
    return this.repository.patchInventoryId(body, params, query);
  }

  async deleteInventoryId(body: any, params: any, query: any) {
    return this.repository.deleteInventoryId(body, params, query);
  }

  async postInventoryRevalue(body: any, params: any, query: any) {
    return this.repository.postInventoryRevalue(body, params, query);
  }

  async postInventoryIdPhotos(body: any, params: any, query: any) {
    return this.repository.postInventoryIdPhotos(body, params, query);
  }

  async deleteInventoryIdPhotosPhotoindex(body: any, params: any, query: any) {
    return this.repository.deleteInventoryIdPhotosPhotoindex(
      body,
      params,
      query,
    );
  }

  async postInventoryBulkImport(body: any, params: any, query: any) {
    return this.repository.postInventoryBulkImport(body, params, query);
  }

  async getInventoryBulkImportJobid(body: any, params: any, query: any) {
    return this.repository.getInventoryBulkImportJobid(body, params, query);
  }

  async getInventoryExport(body: any, params: any, query: any) {
    return this.repository.getInventoryExport(body, params, query);
  }

  async getInventoryPublicDealerid(body: any, params: any, query: any) {
    return this.repository.getInventoryPublicDealerid(body, params, query);
  }
}
