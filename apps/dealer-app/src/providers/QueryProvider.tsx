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
  const userId = useAuthStore((s) => s.user?.id);
  const client = useQueryClient();

  // Clear Query Client cache automatically on user session switch or logout to prevent cross-user data leakage
  useEffect(() => {
    client.clear();
  }, [userId, client]);

  useEffect(() => {
    authService
      .restoreSession()
      .then(async (user) => {
        if (user) {
          setAuth(user);
          // Hydrate latest profile fields (photoUrl etc.) from backend
          try {
            const { data } = await apiClient.get(ENDPOINTS.users.me);
            const merged = {
              ...user,
              photoUrl: data.photoUrl ?? user.photoUrl ?? null,
              sellChannels: data.sellChannels ?? user.sellChannels ?? [],
              sports: data.sports ?? user.sports ?? [],
            };
            setAuth(merged);
            // Persist updated user back to storage
            const { tokenStorage } = await import("../lib/tokenStorage");
            await tokenStorage.setUser(merged);
          } catch {
            // Non-fatal — user is still logged in
          }
        }
        setHydrated();
      })
      .catch(() => {
        setHydrated();
      });
  }, []);

  return <>{children}</>;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </QueryClientProvider>
  );
}
