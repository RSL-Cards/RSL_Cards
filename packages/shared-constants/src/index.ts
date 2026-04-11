export const PLATFORM_FEES: Record<string, number> = {
  ebay: 0.1285,
  whatnot: 0.08,
  mercari: 0.1,
  tcgplayer: 0.1025,
  shopify: 0.02,
};

export const SERVICE_PORTS = {
  development: {
    "auth-service": 3001,
    "user-service": 3002,
    "inventory-service": 3003,
    "transaction-service": 3004,
    "listing-service": 3005,
    "card-db-service": 3006,
    "ai-narrative-service": 3007,
    "notification-service": 3008,
    "analytics-service": 3009,
    "admin-service": 3010,
  },
  dev: {
    "auth-service": 3001,
    "user-service": 3002,
    "inventory-service": 3003,
    "transaction-service": 3004,
    "listing-service": 3005,
    "card-db-service": 3006,
    "ai-narrative-service": 3007,
    "notification-service": 3008,
    "analytics-service": 3009,
    "admin-service": 3010,
  },
  qa: {
    "auth-service": 4001,
    "user-service": 4002,
    "inventory-service": 4003,
    "transaction-service": 4004,
    "listing-service": 4005,
    "card-db-service": 4006,
    "ai-narrative-service": 4007,
    "notification-service": 4008,
    "analytics-service": 4009,
    "admin-service": 4010,
  },
  production: {
    "auth-service": 5001,
    "user-service": 5002,
    "inventory-service": 5003,
    "transaction-service": 5004,
    "listing-service": 5005,
    "card-db-service": 5006,
    "ai-narrative-service": 5007,
    "notification-service": 5008,
    "analytics-service": 5009,
    "admin-service": 5010,
  },
} as const;

export type ServiceName = keyof (typeof SERVICE_PORTS)["development"];

export const DEAL_RATING_THRESHOLDS = {
  good_deal: 0.85,
  fair_price: 1.05,
} as const;

export const JWT_EXPIRY = {
  access: "15m",
  refresh: "7d",
} as const;

export const CACHE_TTL = {
  comps: 900,
  search: 300,
  dashboard: 300,
  narratives: 21600,
} as const;

/** Map NODE_ENV to SERVICE_PORTS key */
export function getServicePortsForNodeEnv(nodeEnv: string): Record<string, number> {
  if (nodeEnv === "production") return { ...SERVICE_PORTS.production };
  if (nodeEnv === "qa") return { ...SERVICE_PORTS.qa };
  if (nodeEnv === "dev") return { ...SERVICE_PORTS.dev };
  return { ...SERVICE_PORTS.development };
}

export const QUEUES = {
  DEACTIVATE_LISTINGS: 'deactivate-listings',
  SALE_NOTIFICATION: 'sale-notification',
  WANT_LIST_MATCH: 'want-list-match',
  OFFER_RECEIVED: 'offer-received',
  PRICE_ALERT_TRIGGERED: 'price-alert-triggered',
  NOTIFY_SEND: 'notify-send',
  AI_NARRATIVE_PUBLISH: 'ai-narrative-publish',
  INVENTORY_AGING_ALERT: 'inventory-aging-alert',
  NARRATIVE_GENERATE: 'narrative-generate',
  DATA_INGESTION: 'data-ingestion',
  ANALYTICS_SNAPSHOT: 'analytics-snapshot',
  TAX_REPORT_GENERATE: 'tax-report-generate',
  OFFLINE_SYNC_DRAIN: 'offline-sync-drain',
  PLATFORM_TOKEN_REFRESH: 'platform-token-refresh',
  EMAIL_SEND: 'email-send'
} as const;

export const CRITICAL_TYPES = ['sale', 'offer_received', 'price_alert', 'want_list_match'] as const;
