import React from "react";
import { useSSE } from "../hooks/useSSE";
import { API_BASE_URL } from "../config/api";
import { NotificationToaster } from "./NotificationToaster";

export function GlobalSSEProvider({ children }: { children: React.ReactNode }) {
  useSSE(`${API_BASE_URL}/v1/notifications/stream`);

  return (
    <>
      {children}
      <NotificationToaster />
    </>
  );
}
