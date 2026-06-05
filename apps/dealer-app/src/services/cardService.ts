import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

export interface ScannedCard {
  player_name: string;
  year: number;
  set_name: string;
  variation?: string;
  sport: string;
  card_number?: string;
  manufacturer?: string;
  is_rookie?: boolean;
  is_autograph?: boolean;
  is_relic?: boolean;
  grading?: {
    company: string;
    grade: string;
    cert_number: string;
  };
}

export interface ScanResponse {
  card: ScannedCard;
  confidence: number;
  cardId?: string;
  variantId?: string;
  playerId?: string;
  fromCache?: boolean;
}

export interface EbaySoldItem {
  itemId: string;
  title: string;
  soldPrice: { value: string; currency: string };
  condition?: string;
  endDate?: string;
  shippingCost?: string;
  itemWebUrl?: string;
  image?: { imageUrl: string };
  location?: string;
}

export interface EbayCompSnapshot {
  platform: string;
  avgSoldPrice: string;
  lastSoldPrice: string;
  lowestActive: string;
  salesCount30d: number;
  priceTrend30d: string | null;
}

export interface EbaySoldResponse {
  query: string;
  fromCache: boolean;
  fetchedAt?: string;
  snapshots?: EbayCompSnapshot[];
  activeListings?: EbaySearchItem[];
  sold7d?: { items: EbaySoldItem[]; totalEntries: number; period: string };
  sold30d?: { items: EbaySoldItem[]; totalEntries: number; period: string };
}

export interface MyslabsSoldItem {
  itemId: string;
  title: string;
  soldPrice: { value: string; currency: string };
  condition?: string;
  endDate?: string;
  shippingCost?: string;
  itemWebUrl?: string;
  image?: { imageUrl: string };
}

export interface MyslabsSoldResponse {
  query: string;
  fromCache: boolean;
  fetchedAt?: string;
  snapshots?: EbayCompSnapshot[];
  activeListings?: MyslabsSoldItem[];
  sold7d?: { items: MyslabsSoldItem[]; totalEntries: number; period: string };
  sold30d?: { items: MyslabsSoldItem[]; totalEntries: number; period: string };
}

export interface EbaySearchItem {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  condition?: string;
  itemWebUrl?: string;
  image?: { imageUrl: string };
}

export interface AddInventoryItem {
  cardId?: string;
  playerId: string;
  year?: number;
  setName?: string;
  variation?: string;
  cardNumber?: string;
  sport?: string;
  gradeCompany?: string;
  gradeValue?: string;
  gradeKey?: string;
  certNumber?: string;
  variantId?: string;
  costBasis: number;
  currentMarketValue?: number;
  notes?: string;
  ebaySalesCompleted?: string;
  ebayActiveListings?: string;
  myslabsSalesCompleted?: string;
  myslabsActiveListings?: string;
  photos?: string[];
}

export interface AddInventoryResponse {
  success: boolean;
  message: string;
  item: {
    id: string;
    player_id: string;
    cost_basis: string;
    added_at: string;
  };
}

export const inventoryService = {
  async addItem(data: AddInventoryItem): Promise<AddInventoryResponse> {
    const { data: res } = await apiClient.post<AddInventoryResponse>(
      ENDPOINTS.inventory.create,
      data,
    );
    return res;
  },

  async list(params?: {
    sport?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: any[];
    pagination: { page: number; limit: number; total: number };
  }> {
    const { data } = await apiClient.get(ENDPOINTS.inventory.list, { params });
    return data;
  },

  async getSummary(): Promise<{
    total_cards: string;
    total_cost_basis: string;
    total_market_value: string;
    total_unrealized_gain: string;
  }> {
    const { data } = await apiClient.get(`${ENDPOINTS.inventory.list}/summary`);
    return data;
  },

  async getItem(id: string): Promise<any> {
    const { data } = await apiClient.get(ENDPOINTS.inventory.detail(id));
    return data;
  },
};

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

  async getEbaySold(
    query: string,
    limit = 10,
    variantId?: string,
    gradeKey?: string,
  ): Promise<EbaySoldResponse> {
    const params: Record<string, any> = { q: query, limit };
    if (variantId) params.variant_id = variantId;
    if (gradeKey) params.grade_key = gradeKey;
    const { data } = await apiClient.get<any>(ENDPOINTS.ebay.sold, { params });
    if (data.fromCache && data.snapshots) {
      return {
        query: data.query,
        fromCache: true,
        fetchedAt: data.fetchedAt,
        snapshots: data.snapshots,
        activeListings: data.activeListings,
        sold7d: data.last7Days,
        sold30d: data.last30Days,
      };
    }
    return {
      query: data.query,
      fromCache: false,
      activeListings: data.activeListings,
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

  async getMyslabsSold(
    query: string,
    limit = 10,
    variantId?: string,
    gradeKey?: string,
  ): Promise<MyslabsSoldResponse> {
    const params: Record<string, any> = { q: query, limit };
    if (variantId) params.variant_id = variantId;
    if (gradeKey) params.grade_key = gradeKey;
    const { data } = await apiClient.get<any>(ENDPOINTS.myslabs.sold, { params });
    if (data.fromCache && data.snapshots) {
      return {
        query: data.query,
        fromCache: true,
        fetchedAt: data.fetchedAt,
        snapshots: data.snapshots,
        activeListings: data.activeListings,
        sold7d: data.last7Days,
        sold30d: data.last30Days,
      };
    }
    return {
      query: data.query,
      fromCache: false,
      activeListings: data.activeListings,
      sold7d: data.last7Days,
      sold30d: data.last30Days,
    };
  },
};
