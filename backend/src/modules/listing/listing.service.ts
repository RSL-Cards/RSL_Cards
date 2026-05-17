import { ListingRepository } from "./listing.repository.js";
import { EbayService } from "./ebay.service.js";
import { SoldCompsService } from "./sold-comps.service.js";
import { env } from "../../config/index.js";

export class ListingService {
  private readonly ebayService = new EbayService(env);
  private readonly soldCompsService = new SoldCompsService(env);

  constructor(private readonly repository: ListingRepository) {}

  async getListings(userId: string) { return this.repository.getListings(userId); }
  async postListings(userId: string, body: any) { return this.repository.postListings(userId, body); }
  async getListingsId(id: string) { return this.repository.getListingsId(id); }
  async patchListingsIdPrice(id: string, body: any) { return this.repository.patchListingsIdPrice(id, body); }
  async deleteListingsId(id: string) { return this.repository.deleteListingsId(id); }
  async postListingsIdRelist(id: string) { return this.repository.postListingsIdRelist(id); }
  async getPriceComparison(inventoryId: string) { return this.repository.getPriceComparison(inventoryId); }
  async getFeeCalculator(query: any) { return this.repository.getFeeCalculator(query); }
  async generateContent(body: any) { return this.repository.generateContent(body); }
  async getAnalytics(userId: string) { return this.repository.getAnalytics(userId); }

  async ebaySearch(params: any) {
    return await this.ebayService.searchListings(params);
  }

  async ebaySold(params: any) {
    return await this.repository.ebaySold(params, this.ebayService, this.soldCompsService);
  }
}
