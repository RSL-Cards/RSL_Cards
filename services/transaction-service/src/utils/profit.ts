import { PLATFORM_FEES } from "@rsl/shared-constants";
import type { DealRating } from "@rsl/shared-types";

export function calculateProfit(
  sellPrice: number,
  costBasis: number,
  platformFeePercent: number,
): number {
  return sellPrice - costBasis - sellPrice * platformFeePercent;
}

export function calculateDealRating(buyPrice: number, compPrice: number): DealRating {
  if (compPrice <= 0) return "fair_price";
  if (buyPrice <= compPrice * 0.85) return "good_deal";
  if (buyPrice <= compPrice * 1.05) return "fair_price";
  return "overpaying";
}

export function calculatePlatformFee(price: number, platform: string): number {
  const pct = PLATFORM_FEES[platform] ?? 0;
  return price * pct;
}

export function calculateMarginPercent(sellPrice: number, costBasis: number): number {
  if (costBasis === 0) return 0;
  return ((sellPrice - costBasis) / costBasis) * 100;
}
