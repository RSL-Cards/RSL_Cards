import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminService } from '@/services/superAdminService'

export const superAdminKeys = {
  all: ['superAdmin'] as const,
  dashboard: () => [...superAdminKeys.all, 'dashboard'] as const,
  usersMetrics: () => [...superAdminKeys.all, 'usersMetrics'] as const,
  usersList: (page: number, limit: number, search: string) =>
    [...superAdminKeys.all, 'usersList', page, limit, search] as const,
  cardsDashboard: () => [...superAdminKeys.all, 'cardsDashboard'] as const,
  cardsInventory: (page: number, limit: number, search: string) =>
    [...superAdminKeys.all, 'cardsInventory', page, limit, search] as const,
  users: () => [...superAdminKeys.all, 'users'] as const,
  dealers: () => [...superAdminKeys.all, 'dealers'] as const,
  cards: () => [...superAdminKeys.all, 'cards'] as const,
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: superAdminKeys.dashboard(),
    queryFn: () => superAdminService.getDashboard(false),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

export function useSuperAdminUsersMetrics() {
  return useQuery({
    queryKey: superAdminKeys.usersMetrics(),
    queryFn: () => superAdminService.getUsersMetrics(false),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSuperAdminUsersList(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: superAdminKeys.usersList(page, limit, search),
    queryFn: () => superAdminService.getUsersList(page, limit, search),
    staleTime: 1000 * 60 * 2,
  })
}

export function useSuperAdminCardsDashboard() {
  return useQuery({
    queryKey: superAdminKeys.cardsDashboard(),
    queryFn: () => superAdminService.getCardsDashboard(false),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSuperAdminCardsInventory(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: superAdminKeys.cardsInventory(page, limit, search),
    queryFn: () => superAdminService.getCardsInventory(page, limit, search),
    staleTime: 1000 * 60 * 2,
  })
}

export function useRefreshSuperAdminDashboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => superAdminService.getDashboard(true),
    onSuccess: (data) => {
      queryClient.setQueryData(superAdminKeys.dashboard(), data)
    },
  })
}

export function useRefreshSuperAdminUsersMetrics() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => superAdminService.getUsersMetrics(true),
    onSuccess: (data) => {
      queryClient.setQueryData(superAdminKeys.usersMetrics(), data)
    },
  })
}

export function useRefreshSuperAdminCardsDashboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => superAdminService.getCardsDashboard(true),
    onSuccess: (data) => {
      queryClient.setQueryData(superAdminKeys.cardsDashboard(), data)
    },
  })
}
