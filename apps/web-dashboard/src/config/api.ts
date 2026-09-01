const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.rslcards.com'

// API Base URL config:
// 1. If running locally on localhost/127.0.0.1, target local backend http://localhost:8080.
// 2. In production environments (e.g. Vercel, AWS), target configured URL (https://api.rslcards.com).
export const API_BASE_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
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
    notificationPreferences: "/v1/users/me/notification-preferences",
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
  transactions: {
    base: '/v1/transactions',
    stats: '/v1/transactions/stats',
  },
  listings: {
    base: '/v1/listings',
  },
  customers: {
    base: '/v1/customers',
    favorite: (id: string) => `/v1/customers/${id}/favorite`,
  },
  settings: {
    profile: '/v1/settings/profile',
    platforms: '/v1/settings/platforms',
    onboarding: '/v1/settings/onboarding',
    paymentMethods: '/v1/settings/payment-methods',
    ebaysync: '/v1/settings/ebay-sync',
  },
  dailyLogs: {
    active: '/v1/daily-logs/active',
    create: '/v1/daily-logs/',
    base: '/v1/daily-logs',
    log: (id: string) => `/v1/daily-logs/${id}`,
    close: (id: string) => `/v1/daily-logs/${id}/close`,
    transactions: (id: string) => `/v1/daily-logs/${id}/transactions`,
  },
  analytics: {
    expenses: '/v1/analytics/expenses',
    expense: (id: string) => `/v1/analytics/expenses/${id}`,
  },
  superAdmin: {
    dashboard: '/v1/super-admin/dashboard',
    usersMetrics: '/v1/super-admin/users/metrics',
    usersList: (page = 1, limit = 10, search = '') =>
      `/v1/super-admin/users/list?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    cardsDashboard: '/v1/super-admin/cards/dashboard',
    cardsInventory: (page = 1, limit = 10, search = '') =>
      `/v1/super-admin/cards/inventory?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    dealersMetrics: '/v1/super-admin/dealers/metrics',
    dealersList: (page = 1, limit = 10, search = '') =>
      `/v1/super-admin/dealers/list?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    dealerDetail: (dealerId: string) => `/v1/super-admin/dealers/${dealerId}`,
    dealerInventory: (dealerId: string, page = 1, limit = 10, search = '') =>
      `/v1/super-admin/dealers/${dealerId}/inventory?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    dealerSoldCards: (dealerId: string, page = 1, limit = 10, search = '') =>
      `/v1/super-admin/dealers/${dealerId}/sold?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    users: '/v1/super-admin/users',
    dealers: '/v1/super-admin/dealers',
    cards: '/v1/super-admin/cards',
    settings: '/v1/super-admin/settings',
  },
} as const

export const SUPER_ADMIN_ENDPOINTS = ENDPOINTS.superAdmin
