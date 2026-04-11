export type UserRole = "dealer" | "consumer" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  playerName: string;
  year: number;
  setName: string;
  cardNumber: string;
  variation: string | null;
  grade: string | null;
  sport: string;
}

export type ListingStatus =
  | "draft"
  | "listed"
  | "sold"
  | "ended"
  | "pending";

export interface InventoryItem {
  id: string;
  userId: string;
  cardId: string;
  playerName: string;
  year: number;
  setName: string;
  grade: string | null;
  costBasis: number;
  currentMarketValue: number;
  quantity: number;
  isConsignment: boolean;
  listingStatus: ListingStatus;
  daysHeld: number;
  addedAt: Date;
  photos: string[];
  sport: string;
  notes: string | null;
}

export type TransactionType = "buy" | "sell" | "trade";
export type DealRating = "good_deal" | "fair_price" | "overpaying";

export interface Transaction {
  id: string;
  userId: string;
  inventoryId: string;
  type: TransactionType;
  channel: string;
  price: number;
  costBasis: number;
  profit: number;
  platformFee: number;
  paymentMethod: string;
  dealRating: DealRating;
  createdAt: Date;
}

export type ListingPlatformStatus = "active" | "sold" | "ended" | "pending";

export interface Listing {
  id: string;
  inventoryId: string;
  userId: string;
  platform: string;
  platformListingId: string;
  status: ListingPlatformStatus;
  listPrice: number;
  platformFeePct: number;
  netToDealer: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  message: string;
}

export type HealthStatus = "ok" | "error";

export interface HealthCheck {
  status: HealthStatus;
  service: string;
  environment: string;
  uptime: number;
  timestamp: string;
  checks: {
    database: {
      status: HealthStatus;
      latency_ms?: number;
      database?: string;
      error?: string;
    };
    redis: {
      status: HealthStatus;
      latency_ms?: number;
      version?: string;
      error?: string;
    };
  };
}
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
  };
}

export class BaseAppError extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface DeactivateListingsPayload {
  inventoryId: string;
  soldPlatform: string;
  soldAt: string;
  dealerId: string;
  cardName: string;
}

export interface SaleNotificationPayload {
  type: string;
  userId: string;
  cardName: string;
  salePrice: number;
  costBasis: number;
  profit: number;
  profitPct: number;
  platform: string;
  transactionId: string;
}

export interface NarrativeGeneratePayload {
  playerName: string;
  sport: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  primaryDriver: string;
  narrativeType: string;
  factorScores: Record<string, number>;
  rawData: any;
  fetchWindow: { from: string; to: string };
}

export interface DataIngestionPayload {
  triggeredAt: string;
  manual: boolean;
}

export interface AiNarrativePublishPayload {
  narrativeId: string;
  playerName: string;
  headline: string;
  shortSummary: string;
  narrativeType: string;
  priceChangePct: number;
  affectedCardIds: string[];
}

export interface PriceAlertTriggeredPayload {
  alertId: string;
  userId: string;
  cardId: string;
  gradeKey: string;
  targetPrice: number;
  currentPrice: number;
  direction: string;
  narrativeId?: string;
}

export interface WantListMatchPayload {
  inventoryId: string;
  cardId: string;
  gradeKey: string;
  dealerId: string;
  dealerName: string;
  price: number;
  playerName: string;
}

export interface AnalyticsSnapshotPayload {
  date: string;
  manual: boolean;
}

export interface TaxReportGeneratePayload {
  userId: string;
  taxYear: number;
  format: string;
  email: string;
}
