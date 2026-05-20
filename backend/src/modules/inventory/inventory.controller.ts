import { InventoryService } from "./inventory.service.js";

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  private getUserId(request: Request): string {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new Error("User ID not found in request headers");
    }
    return userId;
  }

  listInventory = async ({ request, query }: { request: Request; query: any }) => {
    return await this.service.getInventory(query, this.getUserId(request));
  };

  getInventorySummary = async ({ request }: { request: Request }) => {
    return await this.service.getInventorySummary(this.getUserId(request));
  };

  getInventoryAgingAlerts = async ({ request }: { request: Request }) => {
    return await this.service.getInventoryAgingAlerts(this.getUserId(request));
  };

  getItem = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.getInventoryId(params.id, this.getUserId(request));
  };

  addItem = async ({ request, body, set }: { request: Request; body: any; set: any }) => {
    try {
      return await this.service.postInventory(body, this.getUserId(request));
    } catch (error: any) {
      if (error.message.includes("already have this card")) {
        set.status = 409;
        return {
          error: "Duplicate entry",
          message: error.message,
        };
      }
      throw error;
    }
  };

  updateItem = async ({ request, params, body }: { request: Request; params: any; body: any }) => {
    return await this.service.patchInventoryId(params.id, body, this.getUserId(request));
  };

  deleteItem = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.deleteInventoryId(params.id, this.getUserId(request));
  };

  revalueInventory = async ({ request }: { request: Request }) => {
    return await this.service.postInventoryRevalue(this.getUserId(request));
  };

  bulkImport = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postInventoryBulkImport(this.getUserId(request), body);
  };

  getBulkImportStatus = async ({ params }: { params: any }) => {
    return await this.service.getInventoryBulkImportJobId(params.jobId);
  };

  exportInventory = async ({ request, query }: { request: Request; query: any }) => {
    return await this.service.getInventoryExport(this.getUserId(request), query);
  };

  getPublicInventory = async ({ params }: { params: any }) => {
    return await this.service.getInventoryPublicDealerId(params.dealerId);
  };

  uploadPhotos = async ({ request, params, body }: { request: Request; params: any; body: any }) => {
    const userId = this.getUserId(request);
    const { contentType = "image/jpeg", fileName } = body ?? {};
    return await this.service.presignPhotoUpload(params.id, contentType, fileName, userId);
  };

  confirmPhotos = async ({ request, params, body }: { request: Request; params: any; body: any }) => {
    const userId = this.getUserId(request);
    const { url } = body ?? {};
    if (!url) {
      throw new Error("url is required");
    }
    return await this.service.confirmPhotoAdded(params.id, url, userId);
  };

  deletePhoto = async ({ request, params }: { request: Request; params: any }) => {
    const userId = this.getUserId(request);
    const photoIndex = Number(params.photoIndex);
    return await this.service.deletePhoto(params.id, photoIndex, userId);
  };
}
