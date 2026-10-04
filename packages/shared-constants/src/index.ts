export const PLATFORM_FEES: Record<string, number> = {
  ebay: 0.1285,
  whatnot: 0.08,
  mercari: 0.1,
  tcgplayer: 0.1025,
  shopify: 0.02,
};

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

export const CRITICAL_TYPES = ['sale', 'offer_received', 'price_alert', 'want_list_match'] as const;
