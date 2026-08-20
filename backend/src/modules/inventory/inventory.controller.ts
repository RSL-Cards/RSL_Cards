import { InventoryService } from "./inventory.service.js";
import { UnauthorizedError } from "../../errors/index.js";

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  private getUserId(request: Request): string {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new UnauthorizedError("Authentication is required");
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

  getItem = async ({ request, params, query }: { request: Request; params: any; query?: any }) => {
    return await this.service.getInventoryId(params.id, this.getUserId(request), query?.grade);
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

  uploadPhotoDirect = async ({ request, params, body }: { request: Request; params: any; body: any }) => {
    const userId = this.getUserId(request);
    const file = body.photo;
    if (!file) {
      throw new Error("photo file is required");
    }

    const mimeType = file.type || file.mimetype || "image/jpeg";
    const fileName = file.name || file.filename || "photo.jpg";

    const { publicUrl, key } = await this.service.presignPhotoUpload(
      params.id,
      mimeType,
      fileName,
      userId
    );

    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (typeof file?.arrayBuffer === "function") {
      buffer = Buffer.from(await file.arrayBuffer());
    } else if (file?.buffer && (Buffer.isBuffer(file.buffer) || file.buffer instanceof ArrayBuffer)) {
      buffer = Buffer.from(file.buffer);
    } else if (file?.data && (Buffer.isBuffer(file.data) || file.data instanceof ArrayBuffer)) {
      buffer = Buffer.from(file.data);
    } else if (typeof file === "string") {
      const base64Data = file.includes(",") ? file.split(",")[1] : file;
      buffer = Buffer.from(base64Data, "base64");
    } else if (file instanceof ArrayBuffer) {
      buffer = Buffer.from(file);
    } else {
      throw new Error("Invalid or unsupported photo file format");
    }

    const { env } = await import("../../config/index.js");
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    await this.service.confirmPhotoAdded(params.id, publicUrl, userId);

    return { success: true, url: publicUrl };
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
