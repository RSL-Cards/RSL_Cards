import { FastifyRequest, FastifyReply } from "fastify";
import { CardDbService } from "../services/card-db.service.js";

export class CardDbController {
  constructor(
    private readonly service: CardDbService
  ) {}

  scanCard = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.scanCard(req.body as any, {
      info: (o: Record<string, unknown>) => req.log.info(o),
    });
    return reply.send(result);
  };

  scanBarcode = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.scanBarcode(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  searchCards = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.searchCards(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getCard = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getCard(req.body, req.params, req.query);
    return reply.send(result);
  };

  getComps = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getComps(req.body, req.params, req.query);
    return reply.send(result);
  };

  getPriceHistory = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getPriceHistory(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getOfflineDb = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getOfflineDb(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getPriceAlerts = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getPriceAlerts(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  postPriceAlert = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postPriceAlert(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deletePriceAlert = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deletePriceAlert(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getWantList = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getWantList(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  postWantList = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postWantList(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteWantList = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteWantList(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getDealRating = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getDealRating(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
