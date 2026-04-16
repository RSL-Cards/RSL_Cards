import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";
import { useAuthStore } from "../stores/authStore";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

export interface PaymentMethod {
  id: string;
  type: "venmo" | "cashapp" | "zelle" | "paypal";
  handle: string;
  isDefault: boolean;
}

export interface ConnectedPlatform {
  platform: string;
  username: string;
  connected: boolean;
}

const PAYMENT_METHOD_ICONS: Record<PaymentMethod["type"], string> = {
  venmo: "💜",
  cashapp: "💚",
  zelle: "💙",
  paypal: "💛",
};

export function paymentMethodIcon(type: PaymentMethod["type"]) {
  return PAYMENT_METHOD_ICONS[type] ?? "💳";
}

export function usePaymentMethods(enabled = true) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<PaymentMethod[]>({
    queryKey: ["paymentMethods", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.users.paymentMethods);
      return data;
    },
    enabled: !!userId && enabled,
  });
}

export function useConnectedPlatforms(enabled = true) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<ConnectedPlatform[]>({
    queryKey: ["connectedPlatforms", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.users.connectedPlatforms);
      return data;
    },
    enabled: !!userId && enabled,
  });
}

/** Hook to track if screen has been focused at least once */
export function useFetchOnFocus() {
  const [hasFocused, setHasFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocused) {
        setHasFocused(true);
      }
    }, [hasFocused]),
  );

  return hasFocused;
}

/** Refetch profile data when screen is focused again */
export function useRefetchOnFocus() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["paymentMethods", userId] });
        queryClient.invalidateQueries({
          queryKey: ["connectedPlatforms", userId],
        });
      }
    }, [queryClient, userId]),
  );
}
