import type { Env } from "../config/env.js";

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
    };
  }

  async exchangeCodeForTokens(code: string): Promise<EbayTokenResponse> {
    const { clientId, clientSecret, tokenUrl, ruName } = this.config;
    
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
}
