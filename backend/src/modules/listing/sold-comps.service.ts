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

  async getSoldItems(keyword: string): Promise<SoldCompsResponse> {
    const apiKey = this.env.SOLD_COMPS_KEY;
    if (!apiKey) {
      throw new Error("SOLD_COMPS_KEY is not configured");
    }

    const url = new URL(`${this.baseUrl}/scrape`);
    url.searchParams.set("keyword", keyword);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SoldComps API failed (${res.status}): ${text}`);
    }

    return (await res.json()) as SoldCompsResponse;
  }
}
