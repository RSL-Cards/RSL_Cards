import dns from "node:dns";
import type { Env } from "../../config/index.js";

dns.setDefaultResultOrder("ipv4first");

interface EbayTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface EbayItemSummary {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  condition?: string;
  itemWebUrl?: string;
  image?: { imageUrl: string };
  seller?: {
    username: string;
    feedbackScore: number;
    feedbackPercentage: string;
  };
  buyingOptions?: string[];
  listingMarketplaceId?: string;
}

export interface EbaySearchResponse {
  href?: string;
  total: number;
  limit: number;
  offset: number;
  itemSummaries?: EbayItemSummary[];
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

function ebayVars(env: Env) {
  const isProd = env.EBAY_ENV === "production";
  return {
    clientId: isProd ? env.EBAY_PROD_CLIENT_ID : env.EBAY_SANDBOX_CLIENT_ID,
    clientSecret: isProd
      ? env.EBAY_PROD_CLIENT_SECRET
      : env.EBAY_SANDBOX_CLIENT_SECRET,
    apiUrl: isProd ? env.EBAY_PROD_API_URL : env.EBAY_SANDBOX_API_URL,
    tokenUrl: isProd ? env.EBAY_PROD_TOKEN_URL : env.EBAY_SANDBOX_TOKEN_URL,
    findingBase: isProd
      ? "https://svcs.ebay.com/services/search/FindingService/v1"
      : "https://svcs.sandbox.ebay.com/services/search/FindingService/v1",
  };
}

export class EbayService {
  constructor(private readonly env: Env) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (tokenCache && tokenCache.expiresAt > now + 60_000) {
      return tokenCache.token;
    }

    const { clientId, clientSecret, tokenUrl } = ebayVars(this.env);
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay token request failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as EbayTokenResponse;
    tokenCache = {
      token: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };
    return data.access_token;
  }

  async searchListings(params: {
    q: string;
    limit?: number;
    offset?: number;
    sort?: string;
    filter?: string;
  }): Promise<EbaySearchResponse> {
    const { apiUrl } = ebayVars(this.env);
    const token = await this.getAccessToken();
    const url = new URL(`${apiUrl}/buy/browse/v1/item_summary/search`);
    url.searchParams.set("q", params.q);
    url.searchParams.set("limit", String(params.limit ?? 20));
    url.searchParams.set("offset", String(params.offset ?? 0));
    if (params.sort) url.searchParams.set("sort", params.sort);
    if (params.filter) url.searchParams.set("filter", params.filter);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": this.env.EBAY_MARKETPLACE_ID,
        "X-EBAY-C-ENDUSERCTX": "contextualLocation=country=US",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay search failed (${res.status}): ${text}`);
    }

    return (await res.json()) as EbaySearchResponse;
  }

  async getSoldItems(params: {
    q: string;
    days: 7 | 30;
    limit?: number;
    offset?: number;
  }): Promise<{
    items: any[];
    totalEntries: number;
    period: string;
    notice?: string;
  }> {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const browse = await this.searchListings({
      q: params.q,
      limit,
      offset,
      sort: "newlyListed",
      filter: "buyingOptions:{FIXED_PRICE|AUCTION}",
    });

    const items = (browse.itemSummaries ?? [])
      .map((item) => ({
        itemId: item.itemId,
        title: item.title,
        soldPrice: item.price,
        condition: item.condition,
        endDate: null,
        shippingCost: null,
        itemWebUrl: item.itemWebUrl,
        image: item.image,
        location: null,
      }))
      .filter((item) => {
        const price = parseFloat(item.soldPrice?.value ?? "0");
        return price > 0;
      });

    return {
      items,
      totalEntries: browse.total ?? items.length,
      period: `last ${params.days} days`,
    };
  }

  async getItemDetailsByName(name: string): Promise<EbayItemSummary> {
    const searchResult = await this.searchListings({ q: name, limit: 1 });
    const first = searchResult.itemSummaries?.[0];
    if (!first) throw new Error(`No eBay listing found for: "${name}"`);
    return this.getItemDetails(first.itemId);
  }

  async getItemDetails(itemId: string): Promise<EbayItemSummary> {
    const { apiUrl } = ebayVars(this.env);
    const token = await this.getAccessToken();
    const url = `${apiUrl}/buy/browse/v1/item/${encodeURIComponent(itemId)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": this.env.EBAY_MARKETPLACE_ID ?? "EBAY_US",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay get item failed (${res.status}): ${text}`);
    }

    return (await res.json()) as EbayItemSummary;
  }
}
