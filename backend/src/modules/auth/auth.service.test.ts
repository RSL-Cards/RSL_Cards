import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { AuthService } from "./auth.service.js";
import { AuthRepository } from "./auth.repository.js";
import { db } from "../../db/index.js";
import { env } from "../../config/index.js";
import { truncateAllTables } from "../../tests/db.setup.js";
import { users } from "../../db/schema/auth.js";
import { dealerProfiles } from "../../db/schema/user.js";
import { eq } from "drizzle-orm";

describe("AuthService Integration", () => {
  const service = new AuthService(new AuthRepository(), env);

  beforeAll(async () => {
    await truncateAllTables();
  });

  test("registerUser should insert user and return tokens", async () => {
    const payload = {
      email: "newdealer@rslcards.com",
      password: "StrongPassword123!",
      role: "dealer",
    };

    const result = await service.registerUser(payload);

    expect(result.user.email).toBe("newdealer@rslcards.com");
    expect(result.user.role).toBe("dealer");
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    
    // Check if user is actually in DB
    const [dbUser] = await db.select().from(users).where(
      eq(users.email, "newdealer@rslcards.com")
    );
    expect(dbUser).toBeDefined();
  });

  test("loginUser should authenticate and return onboarding status", async () => {
    // 1. Manually add onboarding info
    const [user] = await db.select().from(users).where(
      eq(users.email, "newdealer@rslcards.com")
    );
    
    await db.update(dealerProfiles)
      .set({
        sports: ["basketball", "football"],
        sellChannels: ["ebay", "whatnot"],
        displayName: "RSL Dealer",
      })
      .where(eq(dealerProfiles.userId, user.id));

    // 2. Test Login
    const payload = {
      email: "newdealer@rslcards.com",
      password: "StrongPassword123!",
    };

    const result = await service.loginUser(payload);
    
    expect(result.user.email).toBe("newdealer@rslcards.com");
    expect(result.user.onboardingCompleted).toBe(true);
    expect(result.user.displayName).toBe("RSL Dealer");
    expect(result.user.sports.length).toBe(2);
    expect(result.tokens.accessToken).toBeDefined();
  });
});
