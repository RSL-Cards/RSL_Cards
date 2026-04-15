import { FastifyRequest, FastifyReply } from "fastify";
import * as service from "../services/main.service.js";
import type { Env } from "../config/env.js";

export async function postCardsScan(req: FastifyRequest, reply: FastifyReply) {
  // Identify card from image via Ximilar. Returns card + comps
  const env = (req as any).env as Env;
  const result = await service.postCardsScan(
    req.body,
    req.params,
    req.query,
    env,
    { info: (o: Record<string, unknown>) => req.log.info(o) },
  );
  return reply.send(result);
}

export async function postCardsScanBarcode(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Identify graded card from PSA/BGS/SGC cert barcode
  const result = await service.postCardsScanBarcode(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getCardsSearch(req: FastifyRequest, reply: FastifyReply) {
  // Text search: player, year, set, variation. Returns top matches
  const result = await service.getCardsSearch(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getCardsId(req: FastifyRequest, reply: FastifyReply) {
  // Get card details + current comp data
  const result = await service.getCardsId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getCardsIdComps(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Last 5 eBay sold prices + 30-day average + trend
  const result = await service.getCardsIdComps(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getCardsIdPriceHistory(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // 30/90/365 day price history for sparkline chart
  const result = await service.getCardsIdPriceHistory(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getCardsOfflineDb(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Download compressed offline card DB (top 50K cards)
  const result = await service.getCardsOfflineDb(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getCardsPriceAlerts(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Get user's price alerts
  const result = await service.getCardsPriceAlerts(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function postCardsPriceAlerts(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Create price alert for a card
  const result = await service.postCardsPriceAlerts(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteCardsPriceAlertsId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Delete price alert
  const result = await service.deleteCardsPriceAlertsId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getCardsWantList(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Get user's want list
  const result = await service.getCardsWantList(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function postCardsWantList(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Add card to want list with max price
  const result = await service.postCardsWantList(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function deleteCardsWantListId(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Remove from want list
  const result = await service.deleteCardsWantListId(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}

export async function getCardsDealRating(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Get deal rating (good/fair/overpaying) for price vs comp
  const result = await service.getCardsDealRating(
    req.body,
    req.params,
    req.query,
  );
  return reply.send(result);
}
