import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/main.service.js';

export async function getNarrativesFeed(req: FastifyRequest, reply: FastifyReply) {
  // Market movers feed — latest published narratives (consumer)
  const result = await service.getNarrativesFeed(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getNarrativesInventory(req: FastifyRequest, reply: FastifyReply) {
  // AI narratives relevant to dealer's current inventory
  const result = await service.getNarrativesInventory(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getNarrativesId(req: FastifyRequest, reply: FastifyReply) {
  // Full narrative detail
  const result = await service.getNarrativesId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getNarrativesPlayerPlayername(req: FastifyRequest, reply: FastifyReply) {
  // All narratives for a specific player
  const result = await service.getNarrativesPlayerPlayername(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getNarrativesCardCardid(req: FastifyRequest, reply: FastifyReply) {
  // Why is this card moving? Narratives for a specific card
  const result = await service.getNarrativesCardCardid(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getNarrativesDailyInsight(req: FastifyRequest, reply: FastifyReply) {
  // Single top daily AI insight for dealer home screen
  const result = await service.getNarrativesDailyInsight(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getNarrativesWeeklyRecap(req: FastifyRequest, reply: FastifyReply) {
  // AI weekly recap of collection performance
  const result = await service.getNarrativesWeeklyRecap(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postNarrativesAdminGenerate(req: FastifyRequest, reply: FastifyReply) {
  // Manually trigger narrative generation for a player
  const result = await service.postNarrativesAdminGenerate(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchNarrativesAdminIdApprove(req: FastifyRequest, reply: FastifyReply) {
  // Approve narrative for publishing
  const result = await service.patchNarrativesAdminIdApprove(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchNarrativesAdminIdReject(req: FastifyRequest, reply: FastifyReply) {
  // Reject narrative with reason
  const result = await service.patchNarrativesAdminIdReject(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchNarrativesAdminId(req: FastifyRequest, reply: FastifyReply) {
  // Edit narrative body/headline before publishing
  const result = await service.patchNarrativesAdminId(req.body, req.params, req.query);
  return reply.send(result);
}

