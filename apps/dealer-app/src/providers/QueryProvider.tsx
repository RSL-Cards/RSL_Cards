import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

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
  const setAuth = useAuthStore((s) => s.setAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const userId = useAuthStore((s) => s.user?.id);
  const client = useQueryClient();
  const previousUserId = React.useRef<string | undefined>(undefined);

  // Clear Query Client cache only on real user switches (not initial mount).
  useEffect(() => {
    if (
      previousUserId.current !== undefined &&
      previousUserId.current !== userId
    ) {
      client.clear();
    }
    previousUserId.current = userId;
  }, [userId, client]);

  // Initialize offline sync store on bootstrap
  useEffect(() => {
    import("../stores/syncStore")
      .then(({ useSyncStore }) => {
        useSyncStore.getState().init(client);
      })
      .catch(() => {});
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    const safety = setTimeout(() => {
      if (!cancelled) setHydrated();
    }, 4000);

    authService
      .restoreSession()
      .then(async (user) => {
        if (cancelled) return;
        if (user) {
          setAuth(user);
          try {
            const { data } = await apiClient.get(ENDPOINTS.users.me);
            if (cancelled) return;
            const merged = {
              ...user,
              photoUrl: data.photoUrl ?? user.photoUrl ?? null,
              sellChannels: data.sellChannels ?? user.sellChannels ?? [],
              sports: data.sports ?? user.sports ?? [],
            };
            setAuth(merged);
            const { tokenStorage } = await import("../lib/tokenStorage");
            await tokenStorage.setUser(merged);
          } catch {
            // Non-fatal — user is still logged in
          }
        } else {
          clearAuth();
        }
        setHydrated();
      })
      .catch(() => {
        if (!cancelled) {
          clearAuth();
          setHydrated();
        }
      })
      .finally(() => clearTimeout(safety));

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [setAuth, setHydrated, clearAuth]);

  return <>{children}</>;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </QueryClientProvider>
  );
}
