import { FastifyRequest, FastifyReply } from "fastify";

import { InventoryService } from "../services/inventory.service.js";

export class InventoryController {
  constructor(
    private readonly service: InventoryService
  ) {}

  private getUserId(req: FastifyRequest): string {
    const userId = req.headers["x-user-id"] as string | undefined;
    if (!userId) {
      throw new Error("User ID not found in request headers");
    }
    return userId;
  }

  listInventory = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getInventory(
      req.body,
      req.params,
      req.query,
      this.getUserId(req),
    );
    return reply.send(result);
  };

  getInventorySummary = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getInventorySummary(
      req.body,
      req.params,
      req.query,
      this.getUserId(req),
    );
    return reply.send(result);
  };

  getInventoryAgingAlerts = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.service.getInventoryAgingAlerts(
      req.body,
      req.params,
      req.query,
      this.getUserId(req),
    );
    return reply.send(result);
  };

  getItem = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getInventoryId(
      req.body,
      req.params,
      req.query,
      this.getUserId(req),
    );
    return reply.send(result);
  };

  addItem = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.service.postInventory(
        req.body,
        req.params,
        req.query,
        this.getUserId(req),
      );
      return reply.send(result);
    } catch (error) {
      if ((error as Error).message.includes("already have this card")) {
        return reply.status(409).send({
          error: "Duplicate entry",
          message: (error as Error).message,
        });
      }
      throw error;
    }
  };

  updateItem = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchInventoryId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteItem = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteInventoryId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  revalueInventory = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postInventoryRevalue(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  uploadPhotos = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postInventoryIdPhotos(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deletePhoto = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteInventoryIdPhotosPhotoindex(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  bulkImport = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postInventoryBulkImport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getBulkImportStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getInventoryBulkImportJobid(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  exportInventory = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getInventoryExport(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getPublicInventory = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getInventoryPublicDealerid(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
