import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyLogService } from '@/services/dailyLogService';
import { useAuthStore } from '@/stores/authStore';
import { syncInBackground } from './useDailyLog';

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount?: number; price?: number; playerName?: string; card?: string; paymentMethod?: string; channel?: string }; logId?: string }) =>
      dailyLogService.updateTransaction(id, data),
    onSettled: (_data, _err, vars) => {
      syncInBackground(queryClient, userId, vars.logId);
    },
  });
}
