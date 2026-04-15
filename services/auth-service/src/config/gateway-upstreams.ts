import type { Env } from "./env.js";

export type GatewayUpstreamKey =
  | "user"
  | "inventory"
  | "transaction"
  | "listing"
  | "cardDb"
  | "narrative"
  | "notification"
  | "analytics"
  | "admin";

export const GATEWAY_ROUTES: {
  prefix: string;
  upstreamKey: GatewayUpstreamKey;
}[] = [
  // Support both /v1/prefix and /prefix for flexibility
  { prefix: "/v1/users", upstreamKey: "user" },
  { prefix: "/v1/inventory", upstreamKey: "inventory" },
  { prefix: "/v1/transactions", upstreamKey: "transaction" },
  { prefix: "/v1/listings", upstreamKey: "listing" },
  { prefix: "/v1/cards", upstreamKey: "cardDb" },
  { prefix: "/v1/narratives", upstreamKey: "narrative" },
  { prefix: "/v1/notifications", upstreamKey: "notification" },
  { prefix: "/v1/analytics", upstreamKey: "analytics" },
  { prefix: "/v1/admin", upstreamKey: "admin" },
  // Also support non-v1 prefixes for direct service calls
  { prefix: "/users", upstreamKey: "user" },
  { prefix: "/inventory", upstreamKey: "inventory" },
  { prefix: "/transactions", upstreamKey: "transaction" },
  { prefix: "/listings", upstreamKey: "listing" },
  { prefix: "/cards", upstreamKey: "cardDb" },
  { prefix: "/narratives", upstreamKey: "narrative" },
  { prefix: "/notifications", upstreamKey: "notification" },
  { prefix: "/analytics", upstreamKey: "analytics" },
  { prefix: "/admin", upstreamKey: "admin" },
];

/** Docker Compose DNS names; host dev uses localhost + service ports from env. */
export function serviceOrigins(env: Env): Record<GatewayUpstreamKey, string> {
  const docker = process.env.AUTH_GATEWAY_IN_DOCKER === "1";
  if (docker) {
    return {
      user: "http://user-service:3000",
      inventory: "http://inventory-service:3000",
      transaction: "http://transaction-service:3000",
      listing: "http://listing-service:3000",
      cardDb: "http://card-db-service:3000",
      narrative: "http://ai-narrative-service:3000",
      notification: "http://notification-service:3000",
      analytics: "http://analytics-service:3000",
      admin: "http://admin-service:3000",
    };
  }
  return {
    user: `http://127.0.0.1:${env.USER_SERVICE_PORT}`,
    inventory: `http://127.0.0.1:${env.INVENTORY_SERVICE_PORT}`,
    transaction: `http://127.0.0.1:${env.TRANSACTION_SERVICE_PORT}`,
    listing: `http://127.0.0.1:${env.LISTING_SERVICE_PORT}`,
    cardDb: `http://127.0.0.1:${env.CARD_DB_SERVICE_PORT}`,
    narrative: `http://127.0.0.1:${env.AI_NARRATIVE_SERVICE_PORT}`,
    notification: `http://127.0.0.1:${env.NOTIFICATION_SERVICE_PORT}`,
    analytics: `http://127.0.0.1:${env.ANALYTICS_SERVICE_PORT}`,
    admin: `http://127.0.0.1:${env.ADMIN_SERVICE_PORT}`,
  };
}
