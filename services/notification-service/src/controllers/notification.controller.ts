import { FastifyRequest, FastifyReply } from "fastify";

import { NotificationService } from "../services/notification.service.js";

export class NotificationController {
  constructor(
    private readonly service: NotificationService
  ) {}

  getNotifications = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getNotifications(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  markAsRead = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.markAsRead(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  markAllAsRead = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.markAllAsRead(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getUnreadCount = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getUnreadCount(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getShows = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getShows(req.body, req.params, req.query);
    return reply.send(result);
  };

  getShowDetail = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getShowDetail(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  attendShow = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.attendShow(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  leaveShow = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.leaveShow(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getShowDealers = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getShowDealers(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  adminCreateShow = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.adminCreateShow(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  adminUpdateShow = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.adminUpdateShow(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  adminDeleteShow = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.adminDeleteShow(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
