import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsRepository } from "./analytics.repository.js";
import { db } from "../../db/index.js";
import * as schema from "../../db/schema/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";

describe("AnalyticsService Integration", () => {
  const service = new AnalyticsService(new AnalyticsRepository());
  let mockUserId: string;

  beforeAll(async () => {
    await truncateAllTables();
    
    const [user] = await db.insert(schema.users).values({
      email: "test_analytics@rslcards.com",
    }).returning();
    
    mockUserId = user.id;

    // Seed dummy transactions
    await db.insert(schema.transactions).values({
      userId: mockUserId,
      type: "buy",
      price: "100.00",
      profit: "0.00",
      platformFee: "0.00",
      netToDealer: "100.00",
    });
    
    await db.insert(schema.transactions).values({
      userId: mockUserId,
      type: "sell",
      price: "150.00",
      profit: "30.00",
      platformFee: "15.00",
      netToDealer: "130.00",
    });
  });

  afterAll(async () => {
  });

  test("getDaily should return calculated dashboard stats from DB", async () => {
    const stats = await service.getDaily(mockUserId) as any;
    
    // We expect 1 buy, 1 sell, 100 spent, 150 revenue, 30 profit (130 net - 100 cost)
    expect(Number(stats.cards_bought)).toBe(1);
    expect(Number(stats.cards_sold)).toBe(1);
    expect(Number(stats.total_spent)).toBe(100);
    expect(Number(stats.total_revenue)).toBe(150);
  });
});
