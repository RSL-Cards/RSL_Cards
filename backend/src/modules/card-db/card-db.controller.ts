import { CardDbService } from "./card-db.service.js";
import { logger } from "../../lib/logger.js";

export class CardDbController {
  constructor(private readonly service: CardDbService) {}

  private getUserId(request: Request): string {
    return request.headers.get("x-user-id") || "guest";
  }

  scanCard = async ({ body }: { body: any }) => {
    return await this.service.scanCard(body, logger);
  };

  scanBarcode = async ({ body }: { body: any }) => {
    return await this.service.scanBarcode(body);
  };

  searchCards = async ({ query }: { query: any }) => {
    return await this.service.searchCards(query);
  };

  getCard = async ({ params }: { params: any }) => {
    return await this.service.getCard(params.id);
  };

  getComps = async ({ params }: { params: any }) => {
    return await this.service.getComps(params.id);
  };

  getPriceHistory = async ({ params }: { params: any }) => {
    return await this.service.getPriceHistory(params.id);
  };

  getOfflineDb = async () => {
    return await this.service.getOfflineDb();
  };

  getPriceAlerts = async ({ request }: { request: Request }) => {
    return await this.service.getPriceAlerts(this.getUserId(request));
  };

  postPriceAlert = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postPriceAlert(this.getUserId(request), body);
  };

  deletePriceAlert = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.deletePriceAlert(this.getUserId(request), params.id);
  };

  getWantList = async ({ request }: { request: Request }) => {
    return await this.service.getWantList(this.getUserId(request));
  };

  postWantList = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postWantList(this.getUserId(request), body);
  };

  deleteWantList = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.deleteWantList(this.getUserId(request), params.id);
  };

  getDealRating = async ({ query }: { query: any }) => {
    return await this.service.getDealRating(query);
  };
}
