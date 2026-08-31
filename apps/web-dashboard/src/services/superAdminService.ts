import { apiClient } from '@/lib/axios'
import { ENDPOINTS } from '@/config/api'

export interface SuperAdminDashboardData {
  metrics: {
    totalUsers: number
    totalDealers: number
    totalConsumers: number
    totalAdmins: number
    totalSuperAdmins: number
    totalInventoryCards: number
    totalUniqueCards: number
    totalCardVariants: number
  }
  performance: {
    queryDurationMs: number
    optimization: string
    lastRefreshedAt: string
  }
  timestamp: string
}

export interface SuperAdminUsersMetricsData {
  metrics: {
    totalUsers: number
    totalDealers: number
    totalConsumers: number
    totalAdmins: number
    totalSuperAdmins: number
  }
  performance: {
    queryDurationMs: number
    optimization: string
    lastRefreshedAt: string
  }
  timestamp: string
}

export interface SuperAdminUserListItem {
  id: string
  email: string
  role: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface SuperAdminUsersListResponse {
  data: SuperAdminUserListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    search?: string
  }
  performance: {
    queryDurationMs: number
    optimization: string
  }
  timestamp: string
}

export interface SuperAdminCardsMetricsData {
  metrics: {
    totalCards: number
    uniqueCards: number
    totalVariants: number
    gradedCards: number
    nonGradedCards: number
  }
  performance: {
    queryDurationMs: number
    optimization: string
    lastRefreshedAt: string
  }
  timestamp: string
}

export interface SuperAdminCardsInventoryItem {
  id: string
  isGraded: boolean
  cardName: string
  playerName: string
  year: number | null
  setName: string | null
  variation: string | null
  cardNumber: string | null
  sport: string | null
  gradeCompany: string
  gradeValue: string | null
  gradeKey: string
  variantName: string | null
  isParallel: boolean | null
  printRun: number | null
  quantity: number
  costBasis: string | null
  currentMarketValue: string | null
  listingStatus: string
  addedAt: string
  member: {
    userId: string
    email: string
  }
}

export interface SuperAdminCardsInventoryResponse {
  data: SuperAdminCardsInventoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    search?: string
  }
  performance: {
    queryDurationMs: number
    optimization: string
  }
  timestamp: string
}

export const superAdminService = {
  getDashboard: async (refresh = false): Promise<SuperAdminDashboardData> => {
    const response = await apiClient.get<SuperAdminDashboardData>(
      `${ENDPOINTS.superAdmin.dashboard}${refresh ? '?refresh=true' : ''}`
    )
    return response.data
  },
  getUsersMetrics: async (refresh = false): Promise<SuperAdminUsersMetricsData> => {
    const response = await apiClient.get<SuperAdminUsersMetricsData>(
      `${ENDPOINTS.superAdmin.usersMetrics}${refresh ? '?refresh=true' : ''}`
    )
    return response.data
  },
  getUsersList: async (page = 1, limit = 10, search = ''): Promise<SuperAdminUsersListResponse> => {
    const response = await apiClient.get<SuperAdminUsersListResponse>(
      ENDPOINTS.superAdmin.usersList(page, limit, search)
    )
    return response.data
  },
  getCardsDashboard: async (refresh = false): Promise<SuperAdminCardsMetricsData> => {
    const response = await apiClient.get<SuperAdminCardsMetricsData>(
      `${ENDPOINTS.superAdmin.cardsDashboard}${refresh ? '?refresh=true' : ''}`
    )
    return response.data
  },
  getCardsInventory: async (page = 1, limit = 10, search = ''): Promise<SuperAdminCardsInventoryResponse> => {
    const response = await apiClient.get<SuperAdminCardsInventoryResponse>(
      ENDPOINTS.superAdmin.cardsInventory(page, limit, search)
    )
    return response.data
  },
}
