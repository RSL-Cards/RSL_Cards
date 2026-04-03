import type { DealRating } from "@rsl/shared-types";
import { DEAL_RATING_THRESHOLDS } from "@rsl/shared-constants";

export function calculateProfit(
  sellPrice: number,
  costBasis: number,
  platformFeePercent: number,
): number {
  return sellPrice - costBasis - sellPrice * platformFeePercent;
}

export function calculateDealRating(buyPrice: number, compPrice: number): DealRating {
  if (compPrice <= 0) return "fair_price";
  const ratio = buyPrice / compPrice;
  if (ratio <= DEAL_RATING_THRESHOLDS.good_deal) return "good_deal";
  if (ratio <= DEAL_RATING_THRESHOLDS.fair_price) return "fair_price";
  return "overpaying";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function getDaysHeld(addedAt: Date): number {
  const ms = Date.now() - addedAt.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
