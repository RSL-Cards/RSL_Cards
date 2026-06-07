import { ListingService } from "./listing.service.js";

export class ListingController {
  constructor(private readonly service: ListingService) {}

  private getUserId(request: Request): string {
    return request.headers.get("x-user-id") || "guest";
  }

  getListings = async ({ request }: { request: Request }) => {
    return await this.service.getListings(this.getUserId(request));
  };

  createListing = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.postListings(this.getUserId(request), body);
  };

  publishEbay = async ({ request, body }: { request: Request; body: any }) => {
    return await this.service.publishEbayListing(this.getUserId(request), body);
  };

  getListing = async ({ params }: { params: any }) => {
    return await this.service.getListingsId(params.id);
  };

  updatePrice = async ({ params, body }: { params: any; body: any }) => {
    return await this.service.patchListingsIdPrice(params.id, body);
  };

  deleteListing = async ({ params }: { params: any }) => {
    return await this.service.deleteListingsId(params.id);
  };

  relist = async ({ params }: { params: any }) => {
    return await this.service.postListingsIdRelist(params.id);
  };

  getPriceComparison = async ({ params }: { params: any }) => {
    return await this.service.getPriceComparison(params.inventoryId);
  };

  feeCalculator = async ({ query }: { query: any }) => {
    return await this.service.getFeeCalculator(query);
  };

  generateContent = async ({ body }: { body: any }) => {
    return await this.service.generateContent(body);
  };

  getAnalytics = async ({ request }: { request: Request }) => {
    return await this.service.getAnalytics(this.getUserId(request));
  };

  ebayWebhook = async ({ body }: { body: any }) => {
    return { success: true };
  };

  whatnotWebhook = async ({ body }: { body: any }) => {
    return { success: true };
  };

  mercariWebhook = async ({ body }: { body: any }) => {
    return { success: true };
  };

  tcgplayerWebhook = async ({ body }: { body: any }) => {
    return { success: true };
  };

  shopifyWebhook = async ({ body }: { body: any }) => {
    return { success: true };
  };

  ebaySearch = async ({ query }: { query: any }) => {
    const { q, limit, offset, sort, filter } = query;
    if (!q?.trim()) {
      throw new Error("Query parameter 'q' is required");
    }
    return await this.service.ebaySearch({
      q: q.trim(),
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
      sort,
      filter,
    });
  };

  ebaySold = async ({ query }: { query: any }) => {
    const { q, limit, variant_id, grade_key } = query;
    if (!q?.trim()) {
      throw new Error("Query parameter 'q' is required");
    }
    return await this.service.ebaySold({
      q: q.trim(),
      limit: limit ? Number(limit) : 20,
      variant_id,
      grade_key,
    });
  };

  myslabsSold = async ({ query }: { query: any }) => {
    const { q, limit, variant_id, grade_key } = query;
    if (!q?.trim()) {
      throw new Error("Query parameter 'q' is required");
    }
    return await this.service.myslabsSold({
      q: q.trim(),
      limit: limit ? Number(limit) : 20,
      variant_id,
      grade_key,
    });
  };
}
