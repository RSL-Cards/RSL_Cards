import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { InventoryService } from "./inventory.service.js";
import { InventoryRepository } from "./inventory.repository.js";
import { db, closeDb } from "../../db/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";
import { users } from "../../db/schema/auth.js";

describe("InventoryService Integration", () => {
  const service = new InventoryService(new InventoryRepository());
  let mockUserId: string;

  beforeAll(async () => {
    await truncateAllTables();
    
    // Create a dummy user to own the inventory
    const [user] = await db.insert(users).values({
      email: "test_inventory@rslcards.com",
    }).returning();
    
    mockUserId = user.id;
  });

  afterAll(async () => {
  });

  test("postInventory should add item to real test database", async () => {
    const payload = {
      cardId: "card-999",
      costBasis: "100.00",
    };

    const result = await service.postInventory(payload, mockUserId) as any;
    
    expect(result.item.id).toBeDefined();
    expect(result.item.listing_status).toBe("unlisted");
    expect(result.item.user_id).toBe(mockUserId);
    expect(Number(result.item.cost_basis)).toBe(100);
  });

  test("getInventorySummary should return real aggregate metrics", async () => {
    const summary = await service.getInventorySummary(mockUserId);
    
    expect(Number(summary.total_cards)).toBe(1);
    expect(Number(summary.total_market_value)).toBe(0); // card doesn't have market value set yet
  });
});
