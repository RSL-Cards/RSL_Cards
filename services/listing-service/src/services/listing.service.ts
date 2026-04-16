import { ListingRepository } from "../repositories/listing.repository.js";

export class ListingService {
  constructor(
    private readonly repository: ListingRepository
  ) {}

  async getListings(body: any, params: any, query: any) {
    return this.repository.getListings(body, params, query);
  }

  async postListings(body: any, params: any, query: any) {
    return this.repository.postListings(body, params, query);
  }

  async getListingsId(body: any, params: any, query: any) {
    return this.repository.getListingsId(body, params, query);
  }

  async patchListingsIdPrice(body: any, params: any, query: any) {
    return this.repository.patchListingsIdPrice(body, params, query);
  }

  async deleteListingsId(body: any, params: any, query: any) {
    return this.repository.deleteListingsId(body, params, query);
  }

  async postListingsIdRelist(body: any, params: any, query: any) {
    return this.repository.postListingsIdRelist(body, params, query);
  }

  async getListingsPriceComparisonInventoryid(
    body: any,
    params: any,
    query: any,
  ) {
    return this.repository.getListingsPriceComparisonInventoryid(
      body,
      params,
      query,
    );
  }

  async getListingsFeeCalculator(body: any, params: any, query: any) {
    return this.repository.getListingsFeeCalculator(body, params, query);
  }

  async postListingsGenerateContent(body: any, params: any, query: any) {
    return this.repository.postListingsGenerateContent(body, params, query);
  }

  async postListingsWebhooksEbay(body: any, params: any, query: any) {
    return this.repository.postListingsWebhooksEbay(body, params, query);
  }

  async postListingsWebhooksWhatnot(body: any, params: any, query: any) {
    return this.repository.postListingsWebhooksWhatnot(body, params, query);
  }

  async postListingsWebhooksMercari(body: any, params: any, query: any) {
    return this.repository.postListingsWebhooksMercari(body, params, query);
  }

  async postListingsWebhooksTcgplayer(body: any, params: any, query: any) {
    return this.repository.postListingsWebhooksTcgplayer(body, params, query);
  }

  async postListingsWebhooksShopify(body: any, params: any, query: any) {
    return this.repository.postListingsWebhooksShopify(body, params, query);
  }

  async getListingsAnalytics(body: any, params: any, query: any) {
    return this.repository.getListingsAnalytics(body, params, query);
  }
}
