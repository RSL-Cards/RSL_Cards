'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { useWebPush } from '@/hooks/useWebPush';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 min default
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  // Activate Web Push Notifications registration
  useWebPush();

  const userId = useAuthStore((s) => s.user?.id);
  const client = useQueryClient();

  const prevUserId = React.useRef(userId);

  // Clear Query Client cache automatically on user session switch or logout
  useEffect(() => {
    // Only clear if we had a user before, and it changed (e.g., logout or switch user).
    // This prevents clearing the cache on initial hydration (undefined -> UUID).
    if (prevUserId.current && prevUserId.current !== userId) {
      client.clear();
    }
    prevUserId.current = userId;
  }, [userId, client]);

  // The mobile app checks restoreSession here, but in web-dashboard Zustand already uses local storage persistence.
  // We can just rely on isHydrated from the store.

  return <>{children}</>;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </QueryClientProvider>
  );
}
