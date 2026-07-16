import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { dailyLogService } from '@/services/dailyLogService';
import { useAuthStore } from '@/stores/authStore';

export const dailyLogKeys = {
  all: ['daily-logs'] as const,
  active: (userId?: string) => [...dailyLogKeys.all, 'active', userId] as const,
  transactions: (logId: string) => [...dailyLogKeys.all, 'transactions', logId] as const,
};

export function useDailyLogTransactions(logId: string | undefined) {
  return useInfiniteQuery({
    queryKey: dailyLogKeys.transactions(logId as string),
    queryFn: ({ pageParam = 1 }) => dailyLogService.getLogTransactions(logId as string, pageParam as number, 20),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!logId,
  });
}

export function useActiveDailyLog() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: dailyLogKeys.active(userId),
    queryFn: dailyLogService.getActiveLog,
    enabled: !!userId,
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  
  return useMutation({
    mutationFn: ({ name, startingCash }: { name: string; startingCash?: number }) => 
      dailyLogService.createLog(name, startingCash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.active(userId) });
    },
  });
}

export function useCloseDailyLog() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  
  return useMutation({
    mutationFn: (id: string) => dailyLogService.closeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.active(userId) });
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  
  return useMutation({
    mutationFn: (data: { category: string; amount: number; description?: string; dailyLogId?: string }) => 
      dailyLogService.addExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.active(userId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
