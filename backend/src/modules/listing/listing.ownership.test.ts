import { expect, test, describe, beforeAll } from "bun:test";
import { ListingRepository } from "./listing.repository.js";
import { InventoryRepository } from "../inventory/inventory.repository.js";
import { InventoryService } from "../inventory/inventory.service.js";
import { db } from "../../db/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";
import { users } from "@rsl/shared-db";

describe("Listing and inventory access control", () => {
  const listings = new ListingRepository();
  const inventory = new InventoryRepository();
  const inventoryService = new InventoryService(inventory);
  let ownerId: string;
  let otherDealerId: string;
  let itemId: string;

  beforeAll(async () => {
    await truncateAllTables();
    const [owner] = await db.insert(users).values({ email: "owner@rslcards.com" }).returning();
    const [other] = await db.insert(users).values({ email: "other@rslcards.com" }).returning();
    ownerId = owner.id;
    otherDealerId = other.id;
    const created = (await inventoryService.postInventory(
      { playerName: "Owner Card", costBasis: "10.00", currentMarketValue: "20.00" },
      ownerId,
    )) as any;
    itemId = created.item.id;
  });

  test("another dealer cannot read, reprice, unlist or relist someone else's listing", async () => {
    await expect(listings.getListingsId(otherDealerId, itemId)).rejects.toThrow("Listing not found");
    await expect(listings.patchListingsIdPrice(otherDealerId, itemId, { price: 1 })).rejects.toThrow("Listing not found");
    await expect(listings.deleteListingsId(otherDealerId, itemId)).rejects.toThrow("Listing not found");
    await expect(listings.postListingsIdRelist(otherDealerId, itemId)).rejects.toThrow("Listing not found");
    await expect(listings.getPriceComparison(otherDealerId, itemId)).rejects.toThrow();

    const item = (await listings.getListingsId(ownerId, itemId)) as any;
    expect(Number(item.current_market_value)).toBe(20);
  });

  test("the owner can reprice their listing", async () => {
    const updated = (await listings.patchListingsIdPrice(ownerId, itemId, { price: 35 })) as any;
    expect(Number(updated.current_market_value)).toBe(35);
  });

  test("inventory sort ignores anything that isn't a known column", async () => {
    const injected = "added_at; DROP TABLE inventory; --";
    const result = (await inventory.getInventory({ sort: injected, status: "all" }, ownerId)) as any;
    const rows = result.items ?? result.data ?? result.rows ?? result;
    expect(JSON.stringify(rows)).toContain(itemId);
  });

  test("inventory updates bind values, so quotes in photo URLs and notes are stored as-is", async () => {
    const trickyUrl = "https://cdn.example.com/card'); DROP TABLE inventory; --.jpg";
    await inventory.patchInventoryId(itemId, { photos: [trickyUrl], notes: "Dealer's \"best\" card" }, ownerId);
    const item = (await listings.getListingsId(ownerId, itemId)) as any;
    expect(item.photos).toEqual([trickyUrl]);
    expect(item.notes).toBe("Dealer's \"best\" card");
  });
});
