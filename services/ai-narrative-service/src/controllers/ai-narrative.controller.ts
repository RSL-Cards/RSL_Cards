import { FastifyRequest, FastifyReply } from "fastify";
import { AiNarrativeService } from "../services/ai-narrative.service.js";

export class AiNarrativeController {
  constructor(
    private readonly service: AiNarrativeService
  ) {}

  getFeed = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getFeed(req.body, req.params, req.query);
    return reply.send(result);
  };

  getInventoryNarratives = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getInventoryNarratives(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getNarrative = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getNarrative(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getPlayerNarratives = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getPlayerNarratives(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getCardNarratives = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getCardNarratives(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getDailyInsight = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getDailyInsight(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getWeeklyRecap = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getWeeklyRecap(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  adminGenerate = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.adminGenerate(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  adminApprove = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.adminApprove(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  adminReject = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.adminReject(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  adminUpdate = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.adminUpdate(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
