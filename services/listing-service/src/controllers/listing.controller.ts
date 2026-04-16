import { FastifyRequest, FastifyReply } from "fastify";
import { ListingService } from "../services/listing.service.js";

export class ListingController {
  constructor(
    private readonly service: ListingService
  ) {}

  getListings = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getListings(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  createListing = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListings(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getListing = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getListingsId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  updatePrice = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.patchListingsIdPrice(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  deleteListing = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.deleteListingsId(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  relist = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListingsIdRelist(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getPriceComparison = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getListingsPriceComparisonInventoryid(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  feeCalculator = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getListingsFeeCalculator(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  generateContent = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListingsGenerateContent(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  ebayWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListingsWebhooksEbay(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  whatnotWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListingsWebhooksWhatnot(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  mercariWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListingsWebhooksMercari(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  tcgplayerWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListingsWebhooksTcgplayer(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  shopifyWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.postListingsWebhooksShopify(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };

  getAnalytics = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getListingsAnalytics(
      req.body,
      req.params,
      req.query,
    );
    return reply.send(result);
  };
}
