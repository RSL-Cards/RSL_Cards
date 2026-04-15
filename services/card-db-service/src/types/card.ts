/**
 * Card types for scanning and identification
 */

export interface CardIdentification {
  playerName: string;
  year: number;
  setName: string;
  variation?: string;
  cardNumber?: string;
  sport: string;
  manufacturer?: string;
  isRookie?: boolean;
  isAutograph?: boolean;
  isRelic?: boolean;
  confidence: number;
}

export interface ScannedCard {
  id: string;
  playerName: string;
  year: number;
  setName: string;
  variation?: string;
  cardNumber?: string;
  sport: string;
  manufacturer?: string;
  isRookie: boolean;
  isAutograph: boolean;
  isRelic: boolean;
  stockImageUrl?: string;
  source: 'ximilar' | 'tcdb' | 'manual' | 'cache';
  confidence: number;
  createdAt?: Date;
}

export interface ScanResponse {
  card: ScannedCard;
  confidence: number;
  alternatives?: ScannedCard[];
  fromCache: boolean;
}

export interface ImageHash {
  imageHash: string;
  cardId: string;
  confidence: number;
  createdAt: Date;
}

// Barcode scanning for graded cards
export interface BarcodeScanRequest {
  barcode: string;  // PSA/BGS/SGC cert number
  gradingCompany: 'PSA' | 'BGS' | 'SGC' | 'CSG';
}

export interface GradedCardInfo extends ScannedCard {
  gradeCompany: string;
  gradeValue: string;
  certNumber: string;
  population?: number;
}
