import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useQueryClient } from "@tanstack/react-query";

export function useSSE(url: string) {
  const { tokens } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = tokens?.accessToken;
    if (!url || !token) return;

    // Use a custom header approach if your SSE endpoint requires it, 
    // but native EventSource in browser doesn't support headers well.
    // However, Elysia looks for 'x-user-id' which we can't easily send via native EventSource headers.
    // We can pass it as a query parameter and modify backend to read it from query if authHeader is missing, 
    // OR we can just append it to the URL if the backend allows it.
    // For now, let's assume we can fetch it, or pass token as query.
    // Actually, EventSource doesn't support Authorization headers.
    // We'll pass the token in the URL query string.
    const sseUrl = new URL(url, window.location.origin);
    sseUrl.searchParams.append("token", token);

    const eventSource = new EventSource(sseUrl.toString());
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addNotification({
          type: data.type || "info",
          title: data.title || "Notification",
          message: data.message || data.body || "",
          ...data,
        });

        // If this is a batch status update, invalidate the batch_jobs query
        // so the tasks table updates instantly without needing 5s polling!
        if (data.type === "batch_status" || data.batchId) {
          queryClient.invalidateQueries({ queryKey: ["batch_jobs"] });
        }
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE connection closed or interrupted.");
      eventSource.close();
      // Optional: implement reconnect with exponential backoff
    };

    return () => {
      eventSource.close();
    };
  }, [url, tokens?.accessToken, addNotification, queryClient]);

  return eventSourceRef.current;
}
