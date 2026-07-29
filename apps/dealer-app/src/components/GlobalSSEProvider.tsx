import React from "react";
import { useSSE } from "../hooks/useSSE";
import { API_BASE_URL } from "../config/api";
import { apiClient } from "../lib/apiClient";
import { NotificationToaster } from "./NotificationToaster";
import { useNotificationStore } from "../stores/useNotificationStore";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "@/stores/authStore";

export function GlobalSSEProvider({ children }: { children: React.ReactNode }) {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  useSSE(`${API_BASE_URL}/v1/notifications/stream`);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    notificationService.registerForPushNotificationsAsync().catch((err) => {
      console.warn("[PushToken] Registration error:", err.message);
    });
    apiClient.get("/v1/notifications").then((res) => {
      console.log("[Notifications] raw response:", JSON.stringify(res.data?.slice?.(0, 2)));
      if (Array.isArray(res.data)) {
        const history = res.data.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          message: n.body,
          status: n.status,
          createdAt: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
        }));
        console.log("[Notifications] mapped count:", history.length);
        setNotifications(history);
      }
    }).catch((err) => console.error("[Notifications] fetch error:", err.message));
  }, [isAuthenticated]);

  return (
    <>
      {children}
      <NotificationToaster />
    </>
  );
}
