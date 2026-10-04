import React from "react";
import { useSSE } from "../hooks/useSSE";
import { API_BASE_URL } from "../config/api";
import { apiClient } from "../lib/apiClient";
import { NotificationToaster } from "./NotificationToaster";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useAuthStore } from "../stores/authStore";

export function GlobalSSEProvider({ children }: { children: React.ReactNode }) {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // SSE only connects after auth token is available (guarded inside useSSE).
  useSSE(`${API_BASE_URL}/v1/notifications/stream`);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    // History fetch only — push/OneSignal registration is owned by AuthGuard
    // with a post-paint delay so cold launch never blocks on native permissions.
    const timer = setTimeout(() => {
      apiClient
        .get("/v1/notifications")
        .then((res) => {
          if (!Array.isArray(res.data)) return;
          const history = res.data.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            message: n.body,
            status: n.status,
            createdAt: n.createdAt
              ? new Date(n.createdAt).getTime()
              : Date.now(),
          }));
          setNotifications(history);
        })
        .catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, setNotifications]);

  return (
    <>
      {children}
      <NotificationToaster />
    </>
  );
}
