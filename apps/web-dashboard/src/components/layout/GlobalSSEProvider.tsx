"use client";

import { useEffect } from "react";
import { useSSE } from "../../hooks/useSSE";
import { NotificationToaster } from "./NotificationToaster";
import { API_BASE_URL } from "../../config/api";
import { apiClient } from "../../lib/axios";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { useAuthStore } from "../../stores/authStore";

export function GlobalSSEProvider({ children }: { children: React.ReactNode }) {
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const token = useAuthStore((state) => state.tokens?.accessToken);

  // Only open SSE stream connection when user is authenticated with a valid token
  useSSE(token ? `${API_BASE_URL}/v1/notifications/stream` : "");

  useEffect(() => {
    if (token) {
      apiClient.get("/v1/notifications").then((res) => {
        if (Array.isArray(res.data)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const history = res.data
            .filter((n: any) => new Date(n.createdAt).getTime() >= today.getTime())
            .map((n: any) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.body,
              status: n.status,
              createdAt: new Date(n.createdAt).getTime(),
            }));
          setNotifications(history);
        }
      }).catch(console.error);
    }
  }, [token, setNotifications]);

  return (
    <>
      {children}
      <NotificationToaster />
    </>
  );
}
