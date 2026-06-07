import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { CardDbService } from "./card-db.service.js";
import { CardDbRepository } from "./card-db.repository.js";
import { db, closeDb } from "../../db/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";
import { sql } from "drizzle-orm";

describe("CardDbService Integration", () => {
  const service = new CardDbService(new CardDbRepository());
  let mockPlayerId: string;
  let mockCardId: string;

  beforeAll(async () => {
    await truncateAllTables();
    
    // Seed a player and a card in the master DB
    const playerRes = await db.execute(sql`
      INSERT INTO players (id, name, sport, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Test Player Integration', 'basketball', NOW(), NOW())
      RETURNING id
    `);
    mockPlayerId = (playerRes.rows[0] as any).id;

    const cardRes = await db.execute(sql`
      INSERT INTO cards (id, player_id, year, set_name, card_number, manufacturer, is_rookie, source, created_at, updated_at)
      VALUES (gen_random_uuid(), ${mockPlayerId}, 2026, 'Integration Set', '1', 'Topps', true, 'manual', NOW(), NOW())
      RETURNING id
    `);
    mockCardId = (cardRes.rows[0] as any).id;
  });

  afterAll(async () => {
  });

  test("getCard should fetch card details from test DB", async () => {
    const result = await service.getCard(mockCardId) as any;
    
    expect(result.id).toBe(mockCardId);
    expect(result.player_name).toBe("Test Player Integration");
    expect(result.year).toBe(2026);
    expect(result.is_rookie).toBe(true);
  });
});
