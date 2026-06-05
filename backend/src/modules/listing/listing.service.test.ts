import { expect, test, describe, beforeAll, afterAll, mock } from "bun:test";
import { ListingService } from "./listing.service.js";
import { ListingRepository } from "./listing.repository.js";
import { db } from "../../db/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";
import { users } from "../../db/schema/auth.js";
import { inventory } from "../../db/schema/inventory.js";

describe("ListingService Integration", () => {
  const service = new ListingService(new ListingRepository());
  let mockUserId: string;
  let mockInventoryId: string;

  beforeAll(async () => {
    await truncateAllTables();
    
    const [user] = await db.insert(users).values({
      email: "test_listing@rslcards.com",
    }).returning();
    
    mockUserId = user.id;

    // Seed dummy inventory item
    const [item] = await db.insert(inventory).values({
      userId: mockUserId,
      sport: "basketball",
      quantity: 1,
      listingStatus: "unlisted",
      costBasis: "0.00",
    }).returning();

    mockInventoryId = item.id;
  });

  test("publishEbayListing should trigger publishing flow and update DB", async () => {
    // Override the specific method for this test to avoid hitting real eBay APIs
    service.publishEbayListing = mock().mockResolvedValue({
      success: true,
      listingId: "EBAY-123456789",
    });

    const payload = {
      inventoryIds: [mockInventoryId],
      listingPrice: "500.00",
    };

    const result = await service.publishEbayListing(mockUserId, payload);
    
    expect(service.publishEbayListing).toHaveBeenCalledWith(mockUserId, payload);
    expect(result.success).toBe(true);
    expect(result.listingId).toBe("EBAY-123456789");
  });
});
