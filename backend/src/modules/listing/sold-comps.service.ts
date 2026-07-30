import type { Env } from "../../config/index.js";

export interface SoldCompsItem {
  itemId: string;
  url: string;
  title: string;
  endedAt: string;
  soldPrice: string;
  soldCurrency: string;
  shippingPrice: string | null;
  totalPrice: string;
  sellerUsername: string;
  sellerPositivePercent: number;
  sellerFeedbackScore: number;
  itemCondition?: string;
}

export interface SoldCompsResponse {
  keyword: string;
  totalItems: number;
  hasNextPage: boolean;
  items: SoldCompsItem[];
}

export class SoldCompsService {
  private readonly baseUrl = "https://api.sold-comps.com/v1";

  constructor(private readonly env: Env) {}

  private readonly cache = new Map<string, { data: SoldCompsResponse, timestamp: number }>();
  private readonly inFlight = new Map<string, Promise<SoldCompsResponse>>();

  async getSoldItems(
    keyword: string,
    options?: {
      count?: number;
      ebaySite?: string;
      sortOrder?: string;
      itemCondition?: string;
    }
  ): Promise<SoldCompsResponse> {
    const apiKey = this.env.SOLD_COMPS_KEY;
    if (!apiKey) {
      throw new Error("SOLD_COMPS_KEY is not configured");
    }

    const cacheKey = `${keyword}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }

    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey)!;
    }

    const promise = (async () => {
      const url = new URL(`${this.baseUrl}/scrape`);
      url.searchParams.set("keyword", keyword);
      url.searchParams.set("count", String(options?.count ?? 240));
      url.searchParams.set("ebaySite", options?.ebaySite ?? "ebay.com");
      url.searchParams.set("sortOrder", options?.sortOrder ?? "endedRecently");
      url.searchParams.set("itemCondition", options?.itemCondition ?? "any");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`SoldComps API failed (${res.status}): ${text}`);
      }

      const data = (await res.json()) as SoldCompsResponse;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })().finally(() => {
      this.inFlight.delete(cacheKey);
    });

    this.inFlight.set(cacheKey, promise);
    return promise;
  }
}
