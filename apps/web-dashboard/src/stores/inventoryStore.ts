'use client'

import { create } from 'zustand'
import { InventoryCard, InventorySummary } from '@/components/inventory/inventoryUtils'
import {
  AddInventoryPayload,
  InventoryQuery,
  inventoryService,
} from '@/services/inventoryService'

interface InventoryStore {
  error: string | null
  clearError: () => void
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  error: null,
  clearError: () => set({ error: null }),
}))
