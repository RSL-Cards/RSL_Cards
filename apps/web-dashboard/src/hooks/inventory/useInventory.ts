import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, InventoryQuery, AddInventoryPayload } from '@/services/inventoryService';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: InventoryQuery) => [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string, grade?: string) => [...inventoryKeys.details(), id, grade || 'ALL'] as const,
  summary: () => [...inventoryKeys.all, 'summary'] as const,
  agingAlerts: () => [...inventoryKeys.all, 'agingAlerts'] as const,
};

export function useInventoryList(query: InventoryQuery = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(query),
    queryFn: () => inventoryService.listInventory({
      page: 1,
      limit: 100,
      sort: 'added_at',
      ...query
    }),
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: inventoryService.getSummary,
  });
}

export function useAgingAlerts() {
  return useQuery({
    queryKey: inventoryKeys.agingAlerts(),
    queryFn: inventoryService.getAgingAlerts,
  });
}

export function useInventoryItem(id: string, grade?: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id, grade),
    queryFn: () => inventoryService.getItem(id, grade),
    enabled: !!id,
  });
}

export function useAddInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddInventoryPayload) => inventoryService.addItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddInventoryPayload> }) => 
      inventoryService.updateItem(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useRevalueInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryService.revalueInventory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useBulkImportInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: unknown[]) => inventoryService.bulkImport(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
