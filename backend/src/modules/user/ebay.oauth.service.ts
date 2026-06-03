import type { Env } from "../../config/index.js";

interface EbayTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
}

export class EbayOauthService {
  constructor(private readonly env: Env) {}

  private get config() {
    const isProd = this.env.EBAY_ENV === "production";
    return {
      clientId: isProd ? this.env.EBAY_PROD_CLIENT_ID : this.env.EBAY_SANDBOX_CLIENT_ID,
      clientSecret: isProd ? this.env.EBAY_PROD_CLIENT_SECRET : this.env.EBAY_SANDBOX_CLIENT_SECRET,
      tokenUrl: isProd ? this.env.EBAY_PROD_TOKEN_URL : this.env.EBAY_SANDBOX_TOKEN_URL,
      ruName: isProd ? this.env.EBAY_PROD_RU_NAME : this.env.EBAY_SANDBOX_RU_NAME,
      apiUrl: isProd ? this.env.EBAY_PROD_API_URL : this.env.EBAY_SANDBOX_API_URL,
    };
  }

  async exchangeCodeForTokens(code: string): Promise<EbayTokenResponse> {
    const { clientId, clientSecret, tokenUrl, ruName } = this.config;
    
    console.log("Token Exchange debug:", { clientId, ruName, tokenUrl, EBAY_ENV: this.env.EBAY_ENV });
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: ruName,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`eBay token exchange failed: ${error}`);
    }

    return response.json() as Promise<EbayTokenResponse>;
  }

  async refreshTokens(refreshToken: string): Promise<EbayTokenResponse> {
    const { clientId, clientSecret, tokenUrl } = this.config;
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: "https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account",
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`eBay token refresh failed: ${error}`);
    }

    return response.json() as Promise<EbayTokenResponse>;
  }

  async fetchEbayActiveListings(accessToken: string): Promise<any[]> {
    const { apiUrl } = this.config;
    let items: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${apiUrl}/sell/inventory/v1/inventory_item?offset=${offset}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`eBay inventory fetch failed: ${error}`);
        // If it fails, return whatever we have so far instead of throwing, 
        // to avoid breaking the whole OAuth flow
        break;
      }

      const data = await response.json() as any;
      if (data.inventoryItems && Array.isArray(data.inventoryItems)) {
        items = items.concat(data.inventoryItems);
      }

      if (data.total > offset + limit) {
        offset += limit;
      } else {
        hasMore = false;
      }
    }

    return items;
  }
}
