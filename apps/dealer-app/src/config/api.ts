/**
 * API Configuration
 *
 * All traffic goes through Nginx gateway (port 80 in dev).
 * Nginx routes to microservices based on path prefix.
 *
 * Dev:  http://10.0.2.2:80  (Android emulator → host machine)
 *       http://<LAN_IP>:80  (physical device)
 * Prod: https://api.rslcards.com
 */

// const DEV_HOST = '10.0.2.2' // Android emulator loopback to host
const DEV_HOST = "192.168.10.35"; // physical device — same WiFi as dev machine

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:80`
  : "https://api.rslcards.com";

/**
 * All endpoint paths grouped by microservice domain.
 * The Nginx gateway routes each prefix to the correct service:
 *
 *   /v1/auth/*        → auth-service      :3001
 *   /v1/users/*       → user-service      :3002
 *   /v1/inventory/*   → inventory-service :3003
 *   /v1/transactions/*→ transaction-service:3004
 *   /v1/listings/*    → listing-service   :3005
 *   /v1/cards/*       → auth-service:3001 →→ card-db-service   :3006 (API Gateway)
 *   /v1/narratives/*  → ai-narrative-service:3007
 *   /v1/notifications/*→notification-service:3008
 *   /v1/analytics/*   → analytics-service :3009
 *   /v1/admin/*       → admin-service     :3010
 */
export const ENDPOINTS = {
  auth: {
    login: "/v1/auth/login",
    register: "/v1/auth/register",
    logout: "/v1/auth/logout",
    refresh: "/v1/auth/refresh",
    onboarding: "/v1/auth/onboarding",
    forgotPassword: "/v1/auth/forgot-password",
    resetPassword: "/v1/auth/reset-password",
    verifyEmail: "/v1/auth/verify-email",
    oauthGoogle: "/v1/auth/oauth/google",
    oauthApple: "/v1/auth/oauth/apple",
  },

  users: {
    me: "/v1/auth/me", // auth-service validates JWT, proxies to user-service
    updateProfile: "/v1/auth/me",
    preferences: "/v1/auth/me/preferences",
    paymentMethods: "/v1/auth/me/payment-methods", // auth → user-service (internal)
    connectedPlatforms: "/v1/auth/me/connected-platforms", // auth → user-service (internal)
  },

  inventory: {
    list: "/v1/inventory",
    create: "/v1/inventory",
    detail: (id: string) => `/v1/inventory/${id}`,
    update: (id: string) => `/v1/inventory/${id}`,
    delete: (id: string) => `/v1/inventory/${id}`,
  },

  transactions: {
    list: "/v1/transactions",
    create: "/v1/transactions",
    detail: (id: string) => `/v1/transactions/${id}`,
  },

  listings: {
    list: "/v1/listings",
    create: "/v1/listings",
    detail: (id: string) => `/v1/listings/${id}`,
    update: (id: string) => `/v1/listings/${id}`,
    delete: (id: string) => `/v1/listings/${id}`,
  },

  cards: {
    scan: "/v1/cards/scan",
    scanBarcode: "/v1/cards/scan/barcode",
    search: "/v1/cards/search",
    detail: (id: string) => `/v1/cards/${id}`,
    comps: (id: string) => `/v1/cards/${id}/comps`,
  },

  narratives: {
    generate: "/v1/narratives/generate",
  },

  notifications: {
    list: "/v1/notifications",
    markRead: (id: string) => `/v1/notifications/${id}/read`,
  },

  analytics: {
    dashboard: "/v1/analytics/dashboard",
    daily: "/v1/analytics/daily",
    weekly: "/v1/analytics/weekly",
  },
} as const;
