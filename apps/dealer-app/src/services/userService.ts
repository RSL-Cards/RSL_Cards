import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

export interface ConnectedPlatform {
  platform: string;
  platformUserId?: string;
  isActive: boolean;
  updatedAt: string;
}

export const userService = {
  /** Asks the backend for a signed eBay OAuth state tied to the signed-in user. */
  async createEbayOauthState(returnUrl: string): Promise<string> {
    const { data } = await apiClient.post<{ state: string }>("/v1/users/me/ebay/oauth-state", { returnUrl });
    return data.state;
  },

  async getConnectedPlatforms(): Promise<ConnectedPlatform[]> {
    const { data } = await apiClient.get<ConnectedPlatform[]>(
      ENDPOINTS.users.connectedPlatforms
    );
    return data;
  },

  async connectPlatform(platform: string, code: string): Promise<{ success: true }> {
    const { data } = await apiClient.post<{ success: true }>(
      ENDPOINTS.users.connectedPlatforms,
      { platform, code }
    );
    return data;
  },

  async disconnectPlatform(platform: string): Promise<{ success: true }> {
    const { data } = await apiClient.delete<{ success: true }>(
      `${ENDPOINTS.users.connectedPlatforms}/${platform}`
    );
    return data;
  },

  async deleteAccount(): Promise<{ success: true; message: string }> {
    const { data } = await apiClient.delete<{ success: true; message: string }>(
      ENDPOINTS.users.me
    );
    return data;
  },
};
