import { createHmac, timingSafeEqual } from "node:crypto";
import type { Env } from "../../config/index.js";

// The eBay OAuth `state` round-trips through the browser, so it is signed: otherwise anyone could
// put another user's id in it and attach their own eBay account to that user, or redirect to any site.
const STATE_TTL_MS = 15 * 60 * 1000;
export const DEFAULT_EBAY_RETURN_URL = "rslcards://oauth/ebay";

const sign = (payload: string, env: Env) =>
  createHmac("sha256", `ebay-oauth-state:${env.INTERNAL_SERVICE_KEY}`).update(payload).digest("base64url");

export function isAllowedReturnUrl(returnUrl: string, env: Env) {
  if (returnUrl.startsWith("rslcards://")) return true;
  let url: URL;
  try {
    url = new URL(returnUrl);
  } catch {
    return false;
  }
  if (url.protocol === "https:" && /(^|\.)(rslcards\.com|rslcardspro\.com)$/.test(url.hostname)) return true;
  if (url.protocol === "https:" && url.hostname.endsWith(".amplifyapp.com")) return true;
  if (env.NODE_ENV !== "production") {
    return url.protocol === "exp:" || url.hostname === "localhost" || url.hostname === "127.0.0.1";
  }
  return false;
}

export function createEbayOauthState(userId: string, returnUrl: string, env: Env) {
  const payload = Buffer.from(JSON.stringify({ u: userId, r: returnUrl, e: Date.now() + STATE_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload, env)}`;
}

/** Returns the user and return URL from a signed state, or null if it is forged, expired or malformed. */
export function readEbayOauthState(state: string, env: Env): { userId: string; returnUrl: string } | null {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, env));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const { u, r, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof u !== "string" || typeof r !== "string" || typeof e !== "number" || Date.now() > e) return null;
    return { userId: u, returnUrl: r };
  } catch {
    return null;
  }
}
