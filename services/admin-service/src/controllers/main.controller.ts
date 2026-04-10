import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/main.service.js';

export async function getAdminUsers(req: FastifyRequest, reply: FastifyReply) {
  // List all users with role, status, join date, stats
  const result = await service.getAdminUsers(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAdminUsersId(req: FastifyRequest, reply: FastifyReply) {
  // Full user detail for admin
  const result = await service.getAdminUsersId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchAdminUsersIdRole(req: FastifyRequest, reply: FastifyReply) {
  // Change user role (promote to admin etc)
  const result = await service.patchAdminUsersIdRole(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchAdminUsersIdSuspend(req: FastifyRequest, reply: FastifyReply) {
  // Suspend user account
  const result = await service.patchAdminUsersIdSuspend(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchAdminUsersIdUnsuspend(req: FastifyRequest, reply: FastifyReply) {
  // Restore suspended account
  const result = await service.patchAdminUsersIdUnsuspend(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteAdminUsersId(req: FastifyRequest, reply: FastifyReply) {
  // Permanently delete user and all data
  const result = await service.deleteAdminUsersId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAdminNarrativesPending(req: FastifyRequest, reply: FastifyReply) {
  // Narratives pending admin review queue
  const result = await service.getAdminNarrativesPending(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAdminFeatureFlags(req: FastifyRequest, reply: FastifyReply) {
  // Get all feature flags and current values
  const result = await service.getAdminFeatureFlags(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchAdminFeatureFlagsKey(req: FastifyRequest, reply: FastifyReply) {
  // Toggle a feature flag on or off
  const result = await service.patchAdminFeatureFlagsKey(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAdminReviewsPending(req: FastifyRequest, reply: FastifyReply) {
  // Dealer reviews pending approval
  const result = await service.getAdminReviewsPending(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchAdminReviewsIdApprove(req: FastifyRequest, reply: FastifyReply) {
  // Approve dealer review for public display
  const result = await service.patchAdminReviewsIdApprove(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteAdminReviewsId(req: FastifyRequest, reply: FastifyReply) {
  // Remove inappropriate review
  const result = await service.deleteAdminReviewsId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAdminAuditLogs(req: FastifyRequest, reply: FastifyReply) {
  // System audit log. Query: userId, action, dateFrom
  const result = await service.getAdminAuditLogs(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getAdminStats(req: FastifyRequest, reply: FastifyReply) {
  // Platform stats: total users, daily active, transactions today
  const result = await service.getAdminStats(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getConfigFeatureFlags(req: FastifyRequest, reply: FastifyReply) {
  // Public feature flags for mobile app config
  const result = await service.getConfigFeatureFlags(req.body, req.params, req.query);
  return reply.send(result);
}

