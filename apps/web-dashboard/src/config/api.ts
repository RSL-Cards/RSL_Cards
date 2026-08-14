const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

// If running in a browser on an HTTPS page (like Vercel) and the target URL is plain HTTP (insecure),
// automatically route through Next.js /api/proxy rewrite to avoid browser Mixed Content blocking!
export const API_BASE_URL =
  typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    configuredUrl.startsWith('http://')
    ? '/api/proxy'
    : configuredUrl

export const ENDPOINTS = {
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    sendOtp: '/v1/auth/send-otp',
    verifyOtp: '/v1/auth/verify-otp',
    sendLoginOtp: '/v1/auth/send-login-otp',
    loginWithOtp: '/v1/auth/login-with-otp',
    refresh: '/v1/auth/refresh',
    logout: '/v1/auth/logout',
    forgotPassword: '/v1/auth/forgot-password',
    resetPassword: '/v1/auth/reset-password',
    oauthGoogle: '/v1/auth/oauth/google',
    oauthApple: '/v1/auth/oauth/apple',
  },
  inventory: {
    list: '/v1/inventory',
    publicByDealer: '/v1/inventory/public',
    summary: '/v1/inventory/summary',
    agingAlerts: '/v1/inventory/aging-alerts',
    revalue: '/v1/inventory/revalue',
    bulkImport: '/v1/inventory/bulk-import',
    export: '/v1/inventory/export',
  },
  users: {
    me: "/v1/users/me",
    onboarding: "/v1/users/me/onboarding",
    avatar: "/v1/users/me/avatar",

    paymentMethods: "/v1/users/me/payment-methods",

    connectedPlatforms: "/v1/users/me/connected-platforms",
    customers: '/v1/users/me/customers',

    ebayCallback: '/v1/users/ebay/callback',
    notificationPreferences:
      "/v1/users/me/notification-preferences",
  },
  webDashboard: {
    metrics: '/v1/web-dashboard/metrics',
    revenueChart: '/v1/web-dashboard/revenue-chart',
    channelData: '/v1/web-dashboard/channel-data',
    inventory: '/v1/web-dashboard/inventory',
    inventoryExport: '/v1/web-dashboard/inventory/export',
    inventoryCounts: '/v1/web-dashboard/inventory/counts',
    inventoryItemDetails: (id: string) => `/v1/web-dashboard/inventory/${id}/details`,
    affectedInventory: (playerName: string) => `/v1/web-dashboard/inventory/affected?playerName=${encodeURIComponent(playerName)}`,
    topMovers: '/v1/web-dashboard/top-movers',
    recentTransactions: '/v1/web-dashboard/recent-transactions',
    aiInsights: '/v1/web-dashboard/ai-insights',
    compHistory: (insightId: string) => `/v1/web-dashboard/ai-insights/${insightId}/comp-history`,
    sportProfitMix: '/v1/web-dashboard/ai-insights/sport-profit-mix',
    portfolioSnapshot: '/v1/web-dashboard/portfolio-snapshot',
    transactionsPassbook: '/v1/web-dashboard/transactions/passbook',
  },
  dailyLogs: {
    active: '/v1/daily-logs/active',
    create: '/v1/daily-logs/',
    close: (id: string) => `/v1/daily-logs/${id}/close`,
    transactions: (id: string) => `/v1/daily-logs/${id}/transactions`,
  },
  analytics: {
    expenses: '/v1/analytics/expenses',
    expense: (id: string) => `/v1/analytics/expenses/${id}`,
  },
} as const
