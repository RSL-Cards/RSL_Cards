// Marketplace selling fees used for fee estimates. Keep in sync with the fees in ListingModal.
export const PLATFORM_FEE_TABLE = [
  { platform: 'eBay',      fee_pct: 13.25, shipping: 5,   best_for: 'High-value graded' },
  { platform: 'Whatnot',   fee_pct: 8.00,  shipping: 5,   best_for: 'Live auction lots' },
  { platform: 'TCGPlayer', fee_pct: 10.25, shipping: 5,   best_for: 'Modern sports cards' },
  { platform: 'Shopify',   fee_pct: 2.00,  shipping: 0,   best_for: 'Regular customers' },
  { platform: 'COMC',      fee_pct: 20.00, shipping: 0,   best_for: 'Slow movers, bulk' },
  { platform: 'Mercari',   fee_pct: 10.00, shipping: 5,   best_for: 'Raw/budget cards' },
]
