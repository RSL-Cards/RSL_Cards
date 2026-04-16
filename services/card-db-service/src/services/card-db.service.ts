import { CardDbRepository } from "../repositories/card-db.repository.js";

export class CardDbService {
  constructor(
    private readonly repository: CardDbRepository
  ) {}

  async scanCard(
    body: { image?: string },
    logger: { info: (o: Record<string, unknown>) => void },
  ) {
    return this.repository.scanCard(body, logger);
  }

  async scanBarcode(body: any, params: any, query: any) {
    return this.repository.scanBarcode(body, params, query);
  }

  async searchCards(body: any, params: any, query: any) {
    return this.repository.searchCards(body, params, query);
  }

  async getCard(body: any, params: any, query: any) {
    return this.repository.getCard(body, params, query);
  }

  async getComps(body: any, params: any, query: any) {
    return this.repository.getComps(body, params, query);
  }

  async getPriceHistory(body: any, params: any, query: any) {
    return this.repository.getPriceHistory(body, params, query);
  }

  async getOfflineDb(body: any, params: any, query: any) {
    return this.repository.getOfflineDb(body, params, query);
  }

  async getPriceAlerts(body: any, params: any, query: any) {
    return this.repository.getPriceAlerts(body, params, query);
  }

  async postPriceAlert(body: any, params: any, query: any) {
    return this.repository.postPriceAlert(body, params, query);
  }

  async deletePriceAlert(body: any, params: any, query: any) {
    return this.repository.deletePriceAlert(body, params, query);
  }

  async getWantList(body: any, params: any, query: any) {
    return this.repository.getWantList(body, params, query);
  }

  async postWantList(body: any, params: any, query: any) {
    return this.repository.postWantList(body, params, query);
  }

  async deleteWantList(body: any, params: any, query: any) {
    return this.repository.deleteWantList(body, params, query);
  }

  async getDealRating(body: any, params: any, query: any) {
    return this.repository.getDealRating(body, params, query);
  }
}
