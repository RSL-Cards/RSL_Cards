'use client'

import { create } from 'zustand'
import { InventoryCard, InventorySummary } from '@/components/inventory/inventoryUtils'
import {
  AddInventoryPayload,
  InventoryQuery,
  inventoryService,
} from '@/services/inventoryService'

interface InventoryStore {
  items: InventoryCard[]
  agingAlerts: InventoryCard[]
  summary: InventorySummary | null
  pagination: {
    page: number
    limit: number
    total: number
  }
  isLoading: boolean
  isMutating: boolean
  error: string | null
  fetchInventory: (query?: InventoryQuery) => Promise<void>
  fetchSummary: () => Promise<void>
  fetchAgingAlerts: () => Promise<void>
  refreshInventoryPage: () => Promise<void>
  getItem: (id: string) => Promise<InventoryCard>
  addItem: (payload: AddInventoryPayload) => Promise<void>
  updateItem: (id: string, payload: Partial<AddInventoryPayload>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  revalueInventory: () => Promise<string>
  bulkImport: (rows: unknown[]) => Promise<string>
  getBulkImportStatus: (jobId: string) => Promise<string>
  exportInventory: (query?: { dateFrom?: string; dateTo?: string }) => Promise<unknown[]>
  getPublicInventory: (dealerId: string) => Promise<InventoryCard[]>
  createPhotoUpload: (
    id: string,
    payload: { contentType?: string; fileName?: string },
  ) => Promise<{ uploadUrl: string; publicUrl: string; key: string }>
  confirmPhoto: (id: string, url: string) => Promise<void>
  deletePhoto: (id: string, photoIndex: number) => Promise<void>
  clearError: () => void
}

const emptyPagination = {
  page: 1,
  limit: 100,
  total: 0,
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  agingAlerts: [],
  summary: null,
  pagination: emptyPagination,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchInventory: async (query) => {
    set({ isLoading: true, error: null })

    try {
      const data = await inventoryService.listInventory({
        page: 1,
        limit: 100,
        sort: 'added_at',
        ...query,
      })
      set({
        items: data.items,
        pagination: data.pagination,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load inventory.'
      set({ error: message, isLoading: false })
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await inventoryService.getSummary()
      set({ summary })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load inventory summary.'
      set({ error: message })
    }
  },

  fetchAgingAlerts: async () => {
    try {
      const agingAlerts = await inventoryService.getAgingAlerts()
      set({ agingAlerts })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load aging alerts.'
      set({ error: message })
    }
  },

  refreshInventoryPage: async () => {
    await Promise.all([
      get().fetchInventory(),
      get().fetchSummary(),
      get().fetchAgingAlerts(),
    ])
  },

  getItem: async (id) => {
    try {
      return await inventoryService.getItem(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load inventory item.'
      set({ error: message })
      throw error
    }
  },

  addItem: async (payload) => {
    set({ isMutating: true, error: null })

    try {
      await inventoryService.addItem(payload)
      await get().refreshInventoryPage()
      set({ isMutating: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not add inventory item.'
      set({ error: message, isMutating: false })
      throw error
    }
  },

  updateItem: async (id, payload) => {
    set({ isMutating: true, error: null })

    try {
      await inventoryService.updateItem(id, payload)
      await get().refreshInventoryPage()
      set({ isMutating: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update inventory item.'
      set({ error: message, isMutating: false })
      throw error
    }
  },

  deleteItem: async (id) => {
    set({ isMutating: true, error: null })

    try {
      await inventoryService.deleteItem(id)
      await get().refreshInventoryPage()
      set({ isMutating: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete inventory item.'
      set({ error: message, isMutating: false })
      throw error
    }
  },

  revalueInventory: async () => {
    set({ isMutating: true, error: null })

    try {
      const data = await inventoryService.revalueInventory()
      await get().refreshInventoryPage()
      set({ isMutating: false })
      return data.message
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not revalue inventory.'
      set({ error: message, isMutating: false })
      throw error
    }
  },

  bulkImport: async (rows) => {
    set({ isMutating: true, error: null })

    try {
      const data = await inventoryService.bulkImport(rows)
      await get().refreshInventoryPage()
      set({ isMutating: false })
      return data.jobId ? `${data.message}. Job: ${data.jobId}` : data.message
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not import inventory.'
      set({ error: message, isMutating: false })
      throw error
    }
  },

  getBulkImportStatus: async (jobId) => {
    const data = await inventoryService.getBulkImportStatus(jobId)
    return data.message
  },

  exportInventory: async (query) => {
    const data = await inventoryService.exportInventory(query)
    return data.rows
  },

  getPublicInventory: async (dealerId) => {
    const data = await inventoryService.getPublicInventory(dealerId)
    return data.items
  },

  createPhotoUpload: (id, payload) => inventoryService.createPhotoUpload(id, payload),

  confirmPhoto: async (id, url) => {
    await inventoryService.confirmPhoto(id, url)
    await get().refreshInventoryPage()
  },

  deletePhoto: async (id, photoIndex) => {
    await inventoryService.deletePhoto(id, photoIndex)
    await get().refreshInventoryPage()
  },

  clearError: () => set({ error: null }),
}))
