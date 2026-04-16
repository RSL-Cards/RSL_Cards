import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

export interface ScannedCard {
  id: string;
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
  image_url?: string;
}

export interface ScanResponse {
  card: ScannedCard;
  confidence: number;
  alternatives?: ScannedCard[];
}

export interface CompItem {
  id: string;
  platform: string;
  price: number;
  condition: string;
  date: string;
  url?: string;
}

export interface CompsResponse {
  card_id: string;
  comps: CompItem[];
  median_price: number;
  average_price: number;
  high_price: number;
  low_price: number;
}

export const cardService = {
  /**
   * Scan card image using AI to identify the card
   * @param imageBase64 - Base64 encoded image string (without data URI prefix)
   */
  async scanImage(imageBase64: string): Promise<ScanResponse> {
    const { data } = await apiClient.post<ScanResponse>(ENDPOINTS.cards.scan, {
      image: imageBase64,
    });
    return data;
  },

  /**
   * Scan barcode/QR code to identify card
   * @param barcode - Barcode or certification number
   */
  async scanBarcode(barcode: string): Promise<ScanResponse> {
    const { data } = await apiClient.post<ScanResponse>(ENDPOINTS.cards.scanBarcode, {
      barcode,
    });
    return data;
  },

  /**
   * Get card details by ID
   */
  async getCardDetail(id: string): Promise<ScannedCard> {
    const { data } = await apiClient.get<ScannedCard>(ENDPOINTS.cards.detail(id));
    return data;
  },

  /**
   * Get comparable sales (comps) for a card
   */
  async getComps(id: string): Promise<CompsResponse> {
    const { data } = await apiClient.get<CompsResponse>(ENDPOINTS.cards.comps(id));
    return data;
  },
};
