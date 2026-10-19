import { expect, test, describe } from "bun:test";
import { createEbayOauthState, readEbayOauthState, isAllowedReturnUrl } from "./ebay-oauth-state.js";

const prodEnv = { NODE_ENV: "production", INTERNAL_SERVICE_KEY: "test-internal-service-key" } as any;

describe("eBay OAuth state", () => {
  test("round-trips the user and return URL", () => {
    const state = createEbayOauthState("user-1", "rslcards://oauth/ebay", prodEnv);
    expect(readEbayOauthState(state, prodEnv)).toEqual({ userId: "user-1", returnUrl: "rslcards://oauth/ebay" });
  });

  test("rejects a state whose user id was swapped", () => {
    const state = createEbayOauthState("user-1", "rslcards://oauth/ebay", prodEnv);
    const [, signature] = state.split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ u: "victim", r: "rslcards://oauth/ebay", e: Date.now() + 60_000 })).toString("base64url");
    expect(readEbayOauthState(`${forgedPayload}.${signature}`, prodEnv)).toBeNull();
  });

  test("rejects states signed with a different key and legacy unsigned states", () => {
    const state = createEbayOauthState("user-1", "rslcards://oauth/ebay", { ...prodEnv, INTERNAL_SERVICE_KEY: "other-key" });
    expect(readEbayOauthState(state, prodEnv)).toBeNull();
    expect(readEbayOauthState("user-1___https://evil.example.com", prodEnv)).toBeNull();
  });

  test("only allows returning to the app or RSL sites in production", () => {
    expect(isAllowedReturnUrl("rslcards://oauth/ebay", prodEnv)).toBe(true);
    expect(isAllowedReturnUrl("https://app.rslcards.com/settings", prodEnv)).toBe(true);
    expect(isAllowedReturnUrl("https://evil.example.com/settings", prodEnv)).toBe(false);
    expect(isAllowedReturnUrl("https://rslcards.com.evil.example.com/", prodEnv)).toBe(false);
    expect(isAllowedReturnUrl("http://localhost:3011/settings", prodEnv)).toBe(false);
    expect(isAllowedReturnUrl("http://localhost:3011/settings", { ...prodEnv, NODE_ENV: "development" })).toBe(true);
  });
});
