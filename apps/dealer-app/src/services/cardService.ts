import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

export interface ScannedCard {
  player_name: string;
  year: number;
  set_name: string;
  variation?: string;
  sport: string;
  card_number?: string;
  grading?: {
    company: string;
    grade: string;
    cert_number: string;
  };
}

export interface ScanResponse {
  card: ScannedCard;
  confidence: number;
}

export interface EbaySoldItem {
  itemId: string;
  title: string;
  soldPrice: { value: string; currency: string };
  condition?: string;
  endDate?: string;
  shippingCost?: string;
  itemWebUrl?: string;
  location?: string;
}

export interface EbaySoldResponse {
  sold7d: { items: EbaySoldItem[]; totalEntries: number; period: string };
  sold30d: { items: EbaySoldItem[]; totalEntries: number; period: string };
  query: string;
}

export interface EbaySearchItem {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  condition?: string;
  itemWebUrl?: string;
  image?: { imageUrl: string };
}

export const cardService = {
  async scanImage(imageBase64: string): Promise<ScanResponse> {
    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const { data } = await apiClient.post<ScanResponse>(ENDPOINTS.cards.scan, {
      image: base64,
      mimeType: "image/jpeg",
    });
    return data;
  },

  async scanBarcode(barcode: string): Promise<ScanResponse> {
    const { data } = await apiClient.post<ScanResponse>(
      ENDPOINTS.cards.scanBarcode,
      {
        barcode,
      },
    );
    return data;
  },

  async getEbaySold(query: string, limit = 10): Promise<EbaySoldResponse> {
    const { data } = await apiClient.get<{
      query: string;
      last7Days: {
        items: EbaySoldItem[];
        totalEntries: number;
        period: string;
      };
      last30Days: {
        items: EbaySoldItem[];
        totalEntries: number;
        period: string;
      };
    }>(ENDPOINTS.ebay.sold, { params: { q: query, limit } });
    return {
      query: data.query,
      sold7d: data.last7Days,
      sold30d: data.last30Days,
    };
  },

  async searchEbay(
    query: string,
    limit = 20,
  ): Promise<{ total: number; items: EbaySearchItem[] }> {
    const { data } = await apiClient.get<{
      total: number;
      itemSummaries?: EbaySearchItem[];
    }>(ENDPOINTS.ebay.search, { params: { q: query, limit } });
    return { total: data.total, items: data.itemSummaries ?? [] };
  },
};
