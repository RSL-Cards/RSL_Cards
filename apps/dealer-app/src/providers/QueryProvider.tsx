import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 min default
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    authService
      .restoreSession()
      .then(async (user) => {
        if (user) {
          setAuth(user);
          // Hydrate latest profile fields (photoUrl etc.) from backend
          try {
            const { data } = await apiClient.get(ENDPOINTS.users.me);
            setAuth({ ...user, photoUrl: data.photoUrl ?? null });
            // Persist updated user back to storage
            const { tokenStorage } = await import("../lib/tokenStorage");
            await tokenStorage.setUser({
              ...user,
              photoUrl: data.photoUrl ?? null,
            });
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
