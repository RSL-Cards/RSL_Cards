import type { Env } from "../../config/index.js";

export interface MyslabsItem {
  id: number;
  title: string;
  price: number;
  shipping_cost?: number;
  status: string;
  sold: boolean;
  for_sale: boolean;
  sold_date?: string;
  updated_date?: string;
  created_date?: string;
  year?: number;
  publish_type?: string;
  card_type?: string;
  category?: string;
  slab_link?: string;
  lot_type?: string;
  slab_image_1?: string;
  slab_image_1_thumbnail?: string;
  slab_image_2?: string;
  slab_image_2_thumbnail?: string;
  description?: string;
  grade?: number;
  allow_offer?: boolean;
}

export class MyslabsService {
  constructor(private readonly env: Env) {}

  private async getAccessToken(): Promise<string> {
    const clientId = this.env.MYSLABS_CLIENT_ID;
    const clientSecret = this.env.MYSLABS_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error("MYSLABS_CLIENT_ID and MYSLABS_CLIENT_SECRET are required");
    }

    const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;

    const res = await fetch("https://myslabs.com/api/v2/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`MySlabs token request failed (${res.status}): ${text}`);
    }

    const data = await res.json() as { access_token: string };
    return data.access_token;
  }

  async searchSlabs(params: {
    q: string;
    status?: "for-sale" | "sold";
    limit?: number;
    offset?: number;
  }): Promise<{ items: MyslabsItem[] }> {
    const token = await this.getAccessToken();
    const limit = params.limit || 20;
    const status = params.status || "for-sale";

    const searchUrl = new URL("https://myslabs.com/api/v2/slabs");
    searchUrl.searchParams.set("status", status);
    searchUrl.searchParams.set("query", params.q);
    searchUrl.searchParams.set("page_count", limit.toString());
    searchUrl.searchParams.set("sort", "price_desc"); // Default sort per docs

    const res = await fetch(searchUrl.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`MySlabs search failed (${res.status}): ${text}`);
    }

    const items = await res.json() as MyslabsItem[];
    return { items: items || [] };
  }
}
