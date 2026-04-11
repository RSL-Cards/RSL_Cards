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
