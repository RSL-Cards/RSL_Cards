import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
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
async function syncInBackground(
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

export function useAddExpense() {
  const queryClient = useQueryClient();
  const userId      = useAuthStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: (data: {
      category: string;
      amount: number;
      description?: string;
      dailyLogId?: string;
    }) => dailyLogService.addExpense(data),
    onSuccess: (_data, vars) => syncInBackground(queryClient, userId, vars.dailyLogId),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const userId      = useAuthStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { category: string; amount: number; description?: string };
      logId?: string;
    }) => dailyLogService.updateExpense(id, data),

    // ── Optimistic update: patch the local cache immediately ──────────────────
    onMutate: async (vars) => {
      if (!vars.logId) return;
      const txKey = dailyLogKeys.transactions(userId, vars.logId);

      // Cancel any in-flight refetches so they don't stomp our optimistic data
      await queryClient.cancelQueries({ queryKey: txKey });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<InfiniteData<any[]>>(txKey);

      // Apply optimistic update: replace the matching expense row
      queryClient.setQueryData<InfiniteData<any[]>>(txKey, (old) => {
        if (!old) return old;
        const newDescription = vars.data.description
          ? `${vars.data.category} - ${vars.data.description}`
          : vars.data.category;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((tx: any) =>
              tx.id === vars.id
                ? { ...tx, amount: vars.data.amount.toString(), description: newDescription }
                : tx
            )
          ),
        };
      });

      return { previous, txKey };
    },

    onError: (_err, _vars, context: any) => {
      // Roll back on failure
      if (context?.previous) {
        queryClient.setQueryData(context.txKey, context.previous);
      }
    },

    onSettled: (_data, _err, vars) => {
      // Sync with server in the background
      syncInBackground(queryClient, userId, vars.logId);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const userId      = useAuthStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: ({ id }: { id: string; logId?: string }) =>
      dailyLogService.deleteExpense(id),

    // ── Optimistic update: remove the row immediately ─────────────────────────
    onMutate: async (vars) => {
      if (!vars.logId) return;
      const txKey = dailyLogKeys.transactions(userId, vars.logId);

      await queryClient.cancelQueries({ queryKey: txKey });

      const previous = queryClient.getQueryData<InfiniteData<any[]>>(txKey);

      // Optimistically remove the deleted expense from every page
      queryClient.setQueryData<InfiniteData<any[]>>(txKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.filter((tx: any) => tx.id !== vars.id)
          ),
        };
      });

      return { previous, txKey };
    },

    onError: (_err, _vars, context: any) => {
      // Roll back on failure
      if (context?.previous) {
        queryClient.setQueryData(context.txKey, context.previous);
      }
    },

    onSettled: (_data, _err, vars) => {
      // Sync with server in the background to keep stats accurate
      syncInBackground(queryClient, userId, vars.logId);
    },
  });
}
