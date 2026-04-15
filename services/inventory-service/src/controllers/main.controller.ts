import { FastifyRequest, FastifyReply } from "fastify";
import type { Env } from "../config/env.js";
import * as service from "../services/main.service.js";

// Helper to get userId from request headers (set by auth-service after JWT validation)
function getUserId(req: FastifyRequest): string {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) {
    throw new Error("User ID not found in request headers");
  }
  return userId;
}

// Helper to get env from request
function getEnv(req: FastifyRequest): Env {
  return (req as any).env as Env;
}

export async function getInventory(req: FastifyRequest, reply: FastifyReply) {
  // List inventory. Query: sport, grade, status, sort, page, limit
  const result = await service.getInventory(
    req.body,
    req.params,
    req.query,
    getEnv(req),
    getUserId(req),
  );
  return reply.send(result);
}

export async function getInventorySummary(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Total cards, total cost basis, total market value, unrealized P&L
  const result = await service.getInventorySummary(
    req.body,
    req.params,
    req.query,
    getEnv(req),
    getUserId(req),
  );
  return reply.send(result);
}

export async function getInventoryAgingAlerts(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Cards held 60+ days or losing value
  const result = await service.getInventoryAgingAlerts(
    req.body,
    req.params,
    req.query,
    getEnv(req),
    getUserId(req),
  );
  return reply.send(result);
}

export async function getInventoryId(req: FastifyRequest, reply: FastifyReply) {
  // Get single inventory item with full detail
  const result = await service.getInventoryId(
    req.body,
    req.params,
    req.query,
    getEnv(req),
    getUserId(req),
  );
  return reply.send(result);
}

export async function postInventory(req: FastifyRequest, reply: FastifyReply) {
  // Add card to inventory (manual add) with duplicate check
  try {
    const result = await service.postInventory(
      req.body,
      req.params,
      req.query,
      getEnv(req),
      getUserId(req),
    );
    return reply.send(result);
  } catch (error) {
    // Return 409 Conflict for duplicate entries
    if ((error as Error).message.includes("already have this card")) {
      return reply.status(409).send({
        error: "Duplicate entry",
        message: (error as Error).message,
      });
    }
    throw error;
  }
}

export async function patchInventoryId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Update card details (notes, photos, grade, cost)
  const result = await service.patchInventoryId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteInventoryId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Remove card from inventory
  const result = await service.deleteInventoryId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function postInventoryRevalue(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Trigger manual market value refresh for all cards
  const result = await service.postInventoryRevalue(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function postInventoryIdPhotos(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Upload card photo (returns S3 presigned URL)
  const result = await service.postInventoryIdPhotos(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteInventoryIdPhotosPhotoindex(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Remove a card photo
  const result = await service.deleteInventoryIdPhotosPhotoindex(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function postInventoryBulkImport(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Upload CSV/Excel file for bulk import. Returns jobId
  const result = await service.postInventoryBulkImport(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getInventoryBulkImportJobid(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Poll bulk import job status and progress
  const result = await service.getInventoryBulkImportJobid(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getInventoryExport(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Export inventory as CSV
  const result = await service.getInventoryExport(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getInventoryPublicDealerid(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Get dealer's public inventory for consumer app
  const result = await service.getInventoryPublicDealerid(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}
