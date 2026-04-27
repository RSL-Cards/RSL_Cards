import dns from "node:dns";
import type { Env } from "../config/env.js";

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

export class EbayService {
  constructor(private readonly env: Env) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (tokenCache && tokenCache.expiresAt > now + 60_000) {
      return tokenCache.token;
    }

    const credentials = Buffer.from(
      `${this.env.EBAY_CLIENT_ID}:${this.env.EBAY_CLIENT_SECRET}`,
    ).toString("base64");

    const res = await fetch(this.env.EBAY_TOKEN_URL, {
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
    const token = await this.getAccessToken();
    const url = new URL(
      `${this.env.EBAY_API_URL}/buy/browse/v1/item_summary/search`,
    );
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
  }): Promise<{ items: any[]; totalEntries: number; period: string }> {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - params.days);

    const endTimeTo = now.toISOString();
    const endTimeFrom = from.toISOString();

    // Finding API uses a different base URL
    const findingBase = this.env.EBAY_API_URL.includes("sandbox")
      ? "https://svcs.sandbox.ebay.com/services/search/FindingService/v1"
      : "https://svcs.ebay.com/services/search/FindingService/v1";

    const url = new URL(findingBase);
    url.searchParams.set("OPERATION-NAME", "findCompletedItems");
    url.searchParams.set("VERSION", "1.13.0");
    url.searchParams.set("SECURITY-APPNAME", this.env.EBAY_CLIENT_ID);
    url.searchParams.set("RESPONSE-DATA-FORMAT", "JSON");
    url.searchParams.set("keywords", params.q);
    url.searchParams.set(
      "paginationInput.entriesPerPage",
      String(params.limit ?? 20),
    );
    url.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
    url.searchParams.set("itemFilter(0).value", "true");
    url.searchParams.set("itemFilter(1).name", "EndTimeFrom");
    url.searchParams.set("itemFilter(1).value", endTimeFrom);
    url.searchParams.set("itemFilter(2).name", "EndTimeTo");
    url.searchParams.set("itemFilter(2).value", endTimeTo);

    const res = await fetch(url.toString());

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay Finding API failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as any;
    const response = data?.findCompletedItemsResponse?.[0];
    const searchResult = response?.searchResult?.[0];
    const rawItems: any[] = searchResult?.item ?? [];
    const totalEntries = Number(
      response?.paginationOutput?.[0]?.totalEntries?.[0] ?? 0,
    );

    const items = rawItems.map((item: any) => ({
      itemId: item.itemId?.[0],
      title: item.title?.[0],
      soldPrice: {
        value: item.sellingStatus?.[0]?.currentPrice?.[0]?.["__value__"],
        currency: item.sellingStatus?.[0]?.currentPrice?.[0]?.["@currencyId"],
      },
      condition: item.condition?.[0]?.conditionDisplayName?.[0],
      endDate: item.listingInfo?.[0]?.endTime?.[0],
      shippingCost:
        item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.["__value__"],
      itemWebUrl: item.viewItemURL?.[0],
      location: item.location?.[0],
    }));

    return {
      items,
      totalEntries,
      period: `last ${params.days} days (${endTimeFrom} → ${endTimeTo})`,
    };
  }

  async getItemDetailsByName(name: string): Promise<EbayItemSummary> {
    const searchResult = await this.searchListings({ q: name, limit: 1 });
    const first = searchResult.itemSummaries?.[0];
    if (!first) throw new Error(`No eBay listing found for: "${name}"`);
    return this.getItemDetails(first.itemId);
  }

  async getItemDetails(itemId: string): Promise<EbayItemSummary> {
    const token = await this.getAccessToken();
    const url = `${this.env.EBAY_API_URL}/buy/browse/v1/item/${encodeURIComponent(itemId)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": this.env.EBAY_MARKETPLACE_ID,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay get item failed (${res.status}): ${text}`);
    }

    return (await res.json()) as EbayItemSummary;
  }
}
