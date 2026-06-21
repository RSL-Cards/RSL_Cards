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
// const DEV_HOST = "192.168.10.4"; // Wi-Fi IP address
const DEV_HOST = "3.231.19.101"; // AWS EC2 Instance

export const API_BASE_URL = `http://${DEV_HOST}`;

/**
 * All endpoint paths mapped to the unified backend monorepo.
 * The Nginx gateway routes all /v1/* traffic directly to:
 *
 *   /v1/*   →  backend:8080  (Consolidated Backend Container)
 */
export const ENDPOINTS = {
  auth: {
    login: "/v1/auth/login",
    register: "/v1/auth/register",
    logout: "/v1/auth/logout",
    refresh: "/v1/auth/refresh",
    onboarding: "/v1/users/me/onboarding",
    forgotPassword: "/v1/auth/forgot-password",
    resetPassword: "/v1/auth/reset-password",
    verifyEmail: "/v1/auth/verify-email",
    oauthGoogle: "/v1/auth/oauth/google",
    oauthApple: "/v1/auth/oauth/apple",
  },

  users: {
    me: "/v1/users/me",
    updateProfile: "/v1/users/me",
    avatarUpload: "/v1/users/me/avatar",
    preferences: "/v1/users/me/preferences",
    paymentMethods: "/v1/users/me/payment-methods",
    connectedPlatforms: "/v1/users/me/connected-platforms",
  },

  inventory: {
    list: "/v1/inventory",
    create: "/v1/inventory",
    detail: (id: string) => `/v1/inventory/${id}`,
    update: (id: string) => `/v1/inventory/${id}`,
    delete: (id: string) => `/v1/inventory/${id}`,
    export: "/v1/inventory/export",
    photos: (id: string) => `/v1/inventory/${id}/photos`,
    photosConfirm: (id: string) => `/v1/inventory/${id}/photos/confirm`,
  },

  transactions: {
    list: "/v1/transactions",
    create: "/v1/transactions",
    buy: "/v1/transactions/buy",
    sell: "/v1/transactions/sell",
    detail: (id: string) => `/v1/transactions/${id}`,
    export: "/v1/transactions/export",
  },

  listings: {
    list: "/v1/listings",
    create: "/v1/listings",
    detail: (id: string) => `/v1/listings/${id}`,
    update: (id: string) => `/v1/listings/${id}`,
    delete: (id: string) => `/v1/listings/${id}`,
    priceHistory: (cardId: string, gradeKey: string) =>
      `/v1/listings/price-history/${cardId}?grade_key=${gradeKey}`,
    priceRefreshTrigger: "/v1/listings/price-refresh/trigger",
  },

  cards: {
    scan: "/v1/narratives/scan-card",
    scanBarcode: "/v1/cards/scan/barcode",
    search: "/v1/cards/search",
    detail: (id: string) => `/v1/cards/${id}`,
    comps: (id: string) => `/v1/cards/${id}/comps`,
  },

  ebay: {
    sold: "/v1/listings/ebay/sold",
    search: "/v1/listings/ebay/search",
    itemByName: "/v1/listings/ebay/items/by-name",
  },

  myslabs: {
    sold: "/v1/listings/myslabs/sold",
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
    todayActivity: "/v1/analytics/today-activity",
    report: (period: string) => `/v1/analytics/report?period=${period}`,
    profitChannel: (period: string) =>
      `/v1/analytics/profit/channel?period=${period}`,
  },
} as const;
