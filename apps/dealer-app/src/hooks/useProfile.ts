import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  venmo: "wallet-outline",
  cashapp: "logo-usd",
  zelle: "card-outline",
  paypal: "logo-paypal",
};

export function paymentMethodIcon(type: PaymentMethod["type"]) {
  return PAYMENT_METHOD_ICONS[type] ?? "card-outline";
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  displayName: string;
  bio: string;
  phone: string;
  photoUrl: string | null;
  sports: string[];
  sellChannels: string[];
  subscriptionPlan: string;
  paymentMethods: PaymentMethod[];
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  phone?: string;
  sports?: string[];
  sellChannels?: string[];
  paymentMethods?: { type: string; handle: string }[];
}

export function useProfile(enabled = true) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<UserProfile>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.users.me);
      return data;
    },
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await apiClient.patch(
        ENDPOINTS.users.updateProfile,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["paymentMethods", userId] });
    },
  });
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
    staleTime: 2 * 60 * 1000,
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
    staleTime: 2 * 60 * 1000,
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

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (fileUri: string) => {
      // Step 1 — get presigned URL
      const { data: presign } = await apiClient.post(
        ENDPOINTS.users.avatarUpload,
        { contentType: "image/jpeg" },
      );
      const { uploadUrl, publicUrl } = presign;

      // Step 2 — fetch the local file URI as a blob (works natively on Hermes/RN)
      const fileRes = await fetch(fileUri);
      const blob = await fileRes.blob();

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/jpeg" },
      });
      if (!s3Res.ok) {
        const body = await s3Res.text();
        throw new Error(`S3 upload failed ${s3Res.status}: ${body}`);
      }

      // Step 3 — save URL to profile
      await apiClient.patch(ENDPOINTS.users.updateProfile, {
        photoUrl: publicUrl,
      });
      return publicUrl as string;
    },
    onSuccess: async (publicUrl) => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      if (user) {
        const updated = { ...user, photoUrl: publicUrl };
        setAuth(updated);
        try {
          const { tokenStorage } = await import("../lib/tokenStorage");
          await tokenStorage.setUser(updated);
        } catch {}
      }
    },
  });
}

/** Refetch profile data when screen is focused again */
export function useRefetchOnFocus() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        queryClient.invalidateQueries({ queryKey: ["paymentMethods", userId] });
        queryClient.invalidateQueries({
          queryKey: ["connectedPlatforms", userId],
        });
      }
    }, [queryClient, userId]),
  );
}
