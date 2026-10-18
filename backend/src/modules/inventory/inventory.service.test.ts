import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { InventoryService } from "./inventory.service.js";
import { InventoryRepository } from "./inventory.repository.js";
import { db, closeDb } from "../../db/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";
import { users } from "@rsl/shared-db";
import { sql } from "drizzle-orm";

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
      playerName: "Test Player",
    };

    const result = await service.postInventory(payload, mockUserId) as any;
    
    expect(result.item.id).toBeDefined();
    expect(result.item.listing_status).toBe("unlisted");
    expect(result.item.user_id).toBe(mockUserId);
    expect(Number(result.item.cost_basis)).toBe(100);
  });

  test("postInventory reuses a player that already exists under another sport", async () => {
    const existing = await db.execute(sql`
      INSERT INTO players (id, name, sport, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Mega Gengar', 'pokemon', NOW(), NOW())
      RETURNING id
    `);
    const existingPlayerId = (existing.rows[0] as any).id;
    const [otherUser] = await db.insert(users).values({
      email: "test_inventory_player@rslcards.com",
    }).returning();

    const result = await service.postInventory({
      cardId: "card-gengar",
      costBasis: "1200.00",
      playerName: "Mega Gengar",
    }, otherUser.id) as any;

    expect(result.item.id).toBeDefined();
    const players = await db.execute(sql`SELECT id FROM players WHERE name = 'Mega Gengar'`);
    expect(players.rows.length).toBe(1);
    expect((players.rows[0] as any).id).toBe(existingPlayerId);
  });

  test("getInventorySummary should return real aggregate metrics", async () => {
    const summary = await service.getInventorySummary(mockUserId);
    
    expect(Number(summary.total_cards)).toBe(1);
    expect(Number(summary.total_market_value)).toBe(0); // card doesn't have market value set yet
  });
});
