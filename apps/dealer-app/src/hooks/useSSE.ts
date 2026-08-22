import { useEffect, useRef, useState } from "react";
import EventSource from "react-native-sse";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import { tokenStorage } from "../lib/tokenStorage";
import { useQueryClient } from "@tanstack/react-query";

export function useSSE(url: string) {
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated) {
      tokenStorage.getAccessToken().then(setToken);
    } else {
      setToken(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!token) return;

    // React Native SSE supports passing headers
    const eventSource = new EventSource(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    eventSourceRef.current = eventSource;

    eventSource.addEventListener("message", (event) => {
      try {
        if (event.data) {
          const data = JSON.parse(event.data);
          addNotification({
            type: data.type || "info",
            title: data.title || "Notification",
            message: data.message || data.body || "",
            ...data,
          });

          // Invalidate batch_jobs query if this is a background job status update
          if (data.type === "batch_status" || data.batchId) {
            queryClient.invalidateQueries({ queryKey: ["batch_jobs"] });
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    });

    eventSource.addEventListener("error", (err) => {
      // Silently close without popping red LogBox UI error banner
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [url, token, addNotification, queryClient]);

  return eventSourceRef.current;
}
