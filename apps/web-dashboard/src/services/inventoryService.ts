import { ENDPOINTS } from '@/config/api'
import { apiClient } from '@/lib/axios'
import {
  calculateDaysHeld,
  InventoryCard,
  InventorySummary,
  toDisplaySport,
} from '@/components/inventory/inventoryUtils'

interface InventoryListResponse {
  items: RawInventoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

interface RawInventoryItem {
  id: string
  player_name?: string | null
  year?: number | string | null
  set_name?: string | null
  variation?: string | null
  card_number?: string | null
  sport?: string | null
  grade_key?: string | null
  cert_number?: string | null
  cost_basis?: number | string | null
  current_market_value?: number | string | null
  quantity?: number | string | null
  photos?: string[] | null
  notes?: string | null
  listing_status?: string | null
  listed_platforms?: string[] | null
  ebay_active_listings?: unknown
  added_at?: string | null
}

export interface InventoryQuery {
  sport?: string
  grade?: string
  status?: string
  sort?: string
  page?: number
  limit?: number
}

export interface AddInventoryPayload {
  cardId?: string
  variantId?: string
  playerId?: string
  playerName?: string
  year?: string | number
  setName?: string
  variation?: string
  cardNumber?: string
  sport?: string
  gradeCompany?: string
  gradeValue?: string | number
  gradeKey?: string
  certNumber?: string
  costBasis?: string | number
  currentMarketValue?: string | number
  quantity?: string | number
  photos?: string[]
  notes?: string
  listedPlatforms?: string[]
  ebaySalesCompleted?: unknown
  ebayActiveListings?: unknown
}

const parseNumber = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

async function inventoryRequest<TResponse>(
  path: string,
  options: { method?: string; body?: string } = {},
) {
  const method = (options.method || 'GET').toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
  const data = options.body ? JSON.parse(options.body) : undefined;
  
  const response = await apiClient.request<TResponse>({
    url: path,
    method,
    data
  });
  
  return response.data;
}

const buildQueryString = (query?: object) => {
  const params = new URLSearchParams()

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      params.set(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

const normalizeInventoryItem = (item: RawInventoryItem): InventoryCard => {
  const costBasis = parseNumber(item.cost_basis)
  const marketValue = parseNumber(item.current_market_value)
  const unrealizedGain = (marketValue - costBasis) * parseNumber(item.quantity ?? 1)
  const unrealizedGainPct = costBasis > 0 ? (marketValue - costBasis) / costBasis * 100 : 0
  const activeListings = Array.isArray(item.listed_platforms)
    ? item.listed_platforms
    : Array.isArray(item.ebay_active_listings)
    ? item.ebay_active_listings
    : []

  return {
    id: item.id,
    image_url: item.photos?.[0] ?? '',
    player_name: item.player_name ?? 'Unknown Player',
    year: item.year ? Number(item.year) : null,
    set_name: item.set_name ?? 'Unknown Set',
    grade_key: item.grade_key ?? 'RAW',
    sport: toDisplaySport(item.sport),
    cost_basis: costBasis,
    market_value: marketValue,
    unrealized_gain: Math.round(unrealizedGain),
    unrealized_gain_pct: Number(unrealizedGainPct.toFixed(1)),
    status: item.listing_status ?? 'unlisted',
    days_held: calculateDaysHeld(item.added_at),
    comp_avg: marketValue,
    comp_trend: 0,
    platforms_listed: activeListings.map(String),
    quantity: parseNumber(item.quantity ?? 1),
    card_number: item.card_number ?? null,
    variation: item.variation ?? null,
    cert_number: item.cert_number ?? null,
    notes: item.notes ?? null,
    added_at: item.added_at ?? null,
  }
}

const normalizeSummary = (summary: Partial<InventorySummary>): InventorySummary => ({
  total_cards: parseNumber(summary.total_cards),
  total_cost_basis: parseNumber(summary.total_cost_basis),
  total_market_value: parseNumber(summary.total_market_value),
  total_unrealized_gain: parseNumber(summary.total_unrealized_gain),
})

export const inventoryService = {
  async listInventory(query?: InventoryQuery) {
    const data = await inventoryRequest<InventoryListResponse>(
      `${ENDPOINTS.inventory.list}${buildQueryString(query)}`,
    )

    return {
      items: data.items.map(normalizeInventoryItem),
      pagination: data.pagination,
    }
  },

  async getSummary() {
    const data = await inventoryRequest<Partial<InventorySummary>>(
      ENDPOINTS.inventory.summary,
    )
    return normalizeSummary(data)
  },

  async getAgingAlerts() {
    const data = await inventoryRequest<{ alerts: RawInventoryItem[] }>(
      ENDPOINTS.inventory.agingAlerts,
    )
    return data.alerts.map(normalizeInventoryItem)
  },

  async getItem(id: string) {
    const data = await inventoryRequest<RawInventoryItem>(
      `${ENDPOINTS.inventory.list}/${id}`,
    )
    return normalizeInventoryItem(data)
  },

  addItem(payload: AddInventoryPayload) {
    return inventoryRequest<{ success: boolean; message: string; item: RawInventoryItem }>(
      ENDPOINTS.inventory.list,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },

  updateItem(id: string, payload: Partial<AddInventoryPayload>) {
    return inventoryRequest(`${ENDPOINTS.inventory.list}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  deleteItem(id: string) {
    return inventoryRequest<{ success: boolean }>(
      `${ENDPOINTS.inventory.list}/${id}`,
      { method: 'DELETE' },
    )
  },

  revalueInventory() {
    return inventoryRequest<{ message: string }>(ENDPOINTS.inventory.revalue, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  bulkImport(rows: unknown[]) {
    return inventoryRequest<{ message: string; jobId?: string }>(
      ENDPOINTS.inventory.bulkImport,
      {
        method: 'POST',
        body: JSON.stringify({ rows }),
      },
    )
  },

  getBulkImportStatus(jobId: string) {
    return inventoryRequest<{ message: string }>(
      `${ENDPOINTS.inventory.bulkImport}/${jobId}`,
    )
  },

  exportInventory(query?: { dateFrom?: string; dateTo?: string }) {
    return inventoryRequest<{ rows: RawInventoryItem[]; total: number }>(
      `${ENDPOINTS.inventory.export}${buildQueryString(query)}`,
    )
  },

  async getPublicInventory(dealerId: string) {
    const data = await inventoryRequest<{ items?: RawInventoryItem[]; message?: string }>(
      `${ENDPOINTS.inventory.publicByDealer}/${dealerId}`,
    )
    return {
      ...data,
      items: data.items?.map(normalizeInventoryItem) ?? [],
    }
  },

  createPhotoUpload(id: string, payload: { contentType?: string; fileName?: string }) {
    return inventoryRequest<{ uploadUrl: string; publicUrl: string; key: string }>(
      `${ENDPOINTS.inventory.list}/${id}/photos`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },

  confirmPhoto(id: string, url: string) {
    return inventoryRequest<{ success: boolean }>(
      `${ENDPOINTS.inventory.list}/${id}/photos/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({ url }),
      },
    )
  },

  deletePhoto(id: string, photoIndex: number) {
    return inventoryRequest<{ success: boolean }>(
      `${ENDPOINTS.inventory.list}/${id}/photos/${photoIndex}`,
      { method: 'DELETE' },
    )
  },
}
