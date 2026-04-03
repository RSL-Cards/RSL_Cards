import { describe, expect, it } from "vitest";
import {
  calculateDealRating,
  calculateMarginPercent,
  calculatePlatformFee,
  calculateProfit,
} from "../src/utils/profit.js";

describe("calculateProfit", () => {
  it("subtracts cost and fee", () => {
    expect(calculateProfit(100, 40, 0.1)).toBe(50);
  });
  it("handles zero fee", () => {
    expect(calculateProfit(200, 50, 0)).toBe(150);
  });
  it("handles fractional fee", () => {
    expect(calculateProfit(10, 2, 0.1285)).toBeCloseTo(6.715, 3);
  });
});

describe("calculateDealRating", () => {
  it("good_deal at or below 85% comp", () => {
    expect(calculateDealRating(85, 100)).toBe("good_deal");
    expect(calculateDealRating(84.99, 100)).toBe("good_deal");
  });
  it("fair_price between 85% and 105%", () => {
    expect(calculateDealRating(90, 100)).toBe("fair_price");
    expect(calculateDealRating(105, 100)).toBe("fair_price");
  });
  it("overpaying above 105%", () => {
    expect(calculateDealRating(106, 100)).toBe("overpaying");
  });
  it("non-positive comp is fair_price", () => {
    expect(calculateDealRating(10, 0)).toBe("fair_price");
  });
});

describe("calculatePlatformFee", () => {
  it("uses known platform fees", () => {
    expect(calculatePlatformFee(100, "ebay")).toBeCloseTo(12.85, 2);
    expect(calculatePlatformFee(100, "unknown")).toBe(0);
  });
});

describe("calculateMarginPercent", () => {
  it("computes margin", () => {
    expect(calculateMarginPercent(150, 100)).toBe(50);
  });
  it("zero costBasis returns 0", () => {
    expect(calculateMarginPercent(100, 0)).toBe(0);
  });
});
