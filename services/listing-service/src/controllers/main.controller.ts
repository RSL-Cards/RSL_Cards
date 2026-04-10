import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/main.service.js';

export async function getListings(req: FastifyRequest, reply: FastifyReply) {
  // All active listings across all platforms
  const result = await service.getListings(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListings(req: FastifyRequest, reply: FastifyReply) {
  // Create listing on one or more platforms simultaneously
  const result = await service.postListings(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getListingsId(req: FastifyRequest, reply: FastifyReply) {
  // Single listing detail with platform status
  const result = await service.getListingsId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchListingsIdPrice(req: FastifyRequest, reply: FastifyReply) {
  // Update price on active listing
  const result = await service.patchListingsIdPrice(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteListingsId(req: FastifyRequest, reply: FastifyReply) {
  // End/remove listing from platform
  const result = await service.deleteListingsId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListingsIdRelist(req: FastifyRequest, reply: FastifyReply) {
  // Relist an ended listing
  const result = await service.postListingsIdRelist(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getListingsPriceComparisonInventoryid(req: FastifyRequest, reply: FastifyReply) {
  // Get current prices for a card across all platforms
  const result = await service.getListingsPriceComparisonInventoryid(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getListingsFeeCalculator(req: FastifyRequest, reply: FastifyReply) {
  // Calculate net profit per platform for given price
  const result = await service.getListingsFeeCalculator(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListingsGenerateContent(req: FastifyRequest, reply: FastifyReply) {
  // AI-generate title + description for a card listing
  const result = await service.postListingsGenerateContent(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListingsWebhooksEbay(req: FastifyRequest, reply: FastifyReply) {
  // eBay sold/offer webhook receiver
  const result = await service.postListingsWebhooksEbay(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListingsWebhooksWhatnot(req: FastifyRequest, reply: FastifyReply) {
  // Whatnot sold webhook receiver
  const result = await service.postListingsWebhooksWhatnot(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListingsWebhooksMercari(req: FastifyRequest, reply: FastifyReply) {
  // Mercari sold webhook receiver
  const result = await service.postListingsWebhooksMercari(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListingsWebhooksTcgplayer(req: FastifyRequest, reply: FastifyReply) {
  // TCGPlayer sold webhook receiver
  const result = await service.postListingsWebhooksTcgplayer(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postListingsWebhooksShopify(req: FastifyRequest, reply: FastifyReply) {
  // Shopify order webhook receiver
  const result = await service.postListingsWebhooksShopify(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getListingsAnalytics(req: FastifyRequest, reply: FastifyReply) {
  // Per-platform sales performance, views, watchers
  const result = await service.getListingsAnalytics(req.body, req.params, req.query);
  return reply.send(result);
}

