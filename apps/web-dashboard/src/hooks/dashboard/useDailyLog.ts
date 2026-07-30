import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { dailyLogService } from '@/services/dailyLogService';
import { useAuthStore } from '@/stores/authStore';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const dailyLogKeys = {
  active:       (userId: string)               => ['daily-logs', 'active', userId]               as const,
  transactions: (userId: string, logId: string) => ['daily-logs', 'transactions', userId, logId] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useActiveDailyLog() {
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => {
      queryClient.invalidateQueries();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient]);

  return useQuery({
    queryKey: dailyLogKeys.active(userId),
    queryFn:  dailyLogService.getActiveLog,
    enabled:  !!userId,
    staleTime: 0,
  });
}

export function useDailyLogTransactions(logId: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id ?? '');
  return useInfiniteQuery({
    queryKey:         dailyLogKeys.transactions(userId, logId ?? ''),
    queryFn:          ({ pageParam = 1 }) =>
      dailyLogService.getLogTransactions(logId as string, pageParam as number, 20),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled:  !!userId && !!logId,
    staleTime: 0,
  });
}

// ─── Shared background sync ───────────────────────────────────────────────────
// Called after optimistic updates to keep the server data in sync.
export async function syncInBackground(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  logId?: string,
) {
  // Fire and forget — don't await so the UI is already updated
  queryClient.invalidateQueries({ queryKey: dailyLogKeys.active(userId), refetchType: 'active' });
  if (logId) {
    queryClient.invalidateQueries({
      queryKey: dailyLogKeys.transactions(userId, logId),
      refetchType: 'active',
    });
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  const userId      = useAuthStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: ({ name, startingCash }: { name: string; startingCash?: number }) =>
      dailyLogService.createLog(name, startingCash),
    onSuccess: () => syncInBackground(queryClient, userId),
  });
}

export function useCloseDailyLog() {
  const queryClient = useQueryClient();
  const userId      = useAuthStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: (id: string) => dailyLogService.closeLog(id),
    onSuccess: (_data, logId) => syncInBackground(queryClient, userId, logId),
  });
}

// Re-export expense and transaction hooks from their separate files for backwards compatibility
export { useAddExpense, useUpdateExpense, useDeleteExpense } from './useExpenses';
export { useUpdateTransaction } from './useTransactions';
