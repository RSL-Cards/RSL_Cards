import { CardDbRepository } from "./card-db.repository.js";

export class CardDbService {
  constructor(private readonly repository: CardDbRepository) {}

  async scanCard(body: any, logger: any) {
    return this.repository.scanCard(body, logger);
  }

  async scanBarcode(body: any) {
    return this.repository.scanBarcode(body);
  }

  async searchCards(query: any) {
    return this.repository.searchCards(query);
  }

  async getCard(id: string) {
    return this.repository.getCard(id);
  }

  async getComps(id: string) {
    return this.repository.getComps(id);
  }

  async getPriceHistory(id: string) {
    return this.repository.getPriceHistory(id);
  }

  async getOfflineDb() {
    return this.repository.getOfflineDb();
  }

  async getPriceAlerts(userId: string) {
    return this.repository.getPriceAlerts(userId);
  }

  async postPriceAlert(userId: string, body: any) {
    return this.repository.postPriceAlert(userId, body);
  }

  async deletePriceAlert(userId: string, id: string) {
    return this.repository.deletePriceAlert(userId, id);
  }

  async getWantList(userId: string) {
    return this.repository.getWantList(userId);
  }

  async postWantList(userId: string, body: any) {
    return this.repository.postWantList(userId, body);
  }

  async deleteWantList(userId: string, id: string) {
    return this.repository.deleteWantList(userId, id);
  }

  async getDealRating(query: any) {
    return this.repository.getDealRating(query);
  }
}
