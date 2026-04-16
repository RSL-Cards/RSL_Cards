import { FastifyRequest, FastifyReply } from "fastify";
import { AdminService } from "../services/admin.service.js";

export class AdminController {
  constructor(
    private readonly service: AdminService
  ) {}

  getAdminUsers = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAdminUsers(req.body, req.params, req.query);
    return reply.send(result);
  };

  getAdminUsersId = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAdminUsersId(req.body, req.params, req.query);
    return reply.send(result);
  };

  patchAdminUsersIdRole = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchAdminUsersIdRole(req.body, req.params, req.query);
    return reply.send(result);
  };

  patchAdminUsersIdSuspend = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchAdminUsersIdSuspend(req.body, req.params, req.query);
    return reply.send(result);
  };

  patchAdminUsersIdUnsuspend = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchAdminUsersIdUnsuspend(req.body, req.params, req.query);
    return reply.send(result);
  };

  deleteAdminUsersId = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteAdminUsersId(req.body, req.params, req.query);
    return reply.send(result);
  };

  getAdminNarrativesPending = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAdminNarrativesPending(req.body, req.params, req.query);
    return reply.send(result);
  };

  getAdminFeatureFlags = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAdminFeatureFlags(req.body, req.params, req.query);
    return reply.send(result);
  };

  patchAdminFeatureFlagsKey = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchAdminFeatureFlagsKey(req.body, req.params, req.query);
    return reply.send(result);
  };

  getAdminReviewsPending = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAdminReviewsPending(req.body, req.params, req.query);
    return reply.send(result);
  };

  patchAdminReviewsIdApprove = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchAdminReviewsIdApprove(req.body, req.params, req.query);
    return reply.send(result);
  };

  deleteAdminReviewsId = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteAdminReviewsId(req.body, req.params, req.query);
    return reply.send(result);
  };

  getAdminAuditLogs = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAdminAuditLogs(req.body, req.params, req.query);
    return reply.send(result);
  };

  getAdminStats = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getAdminStats(req.body, req.params, req.query);
    return reply.send(result);
  };

  getConfigFeatureFlags = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getConfigFeatureFlags(req.body, req.params, req.query);
    return reply.send(result);
  };
}
