import { expect, test, describe, beforeAll, afterAll, mock } from "bun:test";
import { UserService } from "./user.service.js";
import { UserRepository } from "./user.repository.js";
import { EbayOauthService } from "./ebay.oauth.service.js";
import { db, closeDb } from "../../db/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";
import { users } from "../../db/schema/auth.js";
import { customers } from "../../db/schema/user.js";

describe("UserService Integration", () => {
  const mockEbayAuth = {} as unknown as EbayOauthService;
  const service = new UserService(new UserRepository(), mockEbayAuth);
  let mockUserId: string;

  beforeAll(async () => {
    await truncateAllTables();
    
    const [user] = await db.insert(users).values({
      email: "test_user_integration@rslcards.com",
    }).returning();
    
    mockUserId = user.id;

    await db.insert(customers).values({
      userId: mockUserId,
      name: "John Doe",
      email: "john@example.com",
    });
  });

  afterAll(async () => {
  });

  test("getCustomers should return customers from DB", async () => {
    const result = await service.getCustomers(mockUserId) as any;
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("John Doe");
    expect(result[0].email).toBe("john@example.com");
  });
});
