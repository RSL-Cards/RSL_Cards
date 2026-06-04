// export const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://3.231.19.101'
export const API_BASE_URL ="http://localhost:8080"

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
} as const
