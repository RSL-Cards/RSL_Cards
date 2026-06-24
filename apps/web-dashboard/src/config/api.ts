// export const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://3.231.19.101'
export const API_BASE_URL = "http://localhost:8080"

export const ENDPOINTS = {
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
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
    inventoryCounts: '/v1/web-dashboard/inventory/counts',
    inventoryItemDetails: (id: string) => `/v1/web-dashboard/inventory/${id}/details`,
    topMovers: '/v1/web-dashboard/top-movers',
    recentTransactions: '/v1/web-dashboard/recent-transactions',
    aiInsights: '/v1/web-dashboard/ai-insights',
    portfolioSnapshot: '/v1/web-dashboard/portfolio-snapshot',
  },
} as const
