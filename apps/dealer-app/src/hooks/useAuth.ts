import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
} from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { useOnboardingStore } from "../stores/onboardingStore";
import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

function getErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as any)?.response?.data?.error?.message ??
    (error as any)?.response?.data?.message ??
    fallback
  );
}

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data.user);
      Toast.show({
        type: "success",
        text1: `Welcome back, ${data.user.displayName}!`,
      });
      if (!data.user.onboardingCompleted) {
        router.replace("/(auth)/onboarding/sports");
      } else {
        router.replace("/(tabs)");
      }
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: getErrorMessage(error, "Invalid email or password."),
      });
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setAuth(data.user);
      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: "Let's set up your profile.",
      });
      router.push("/(auth)/onboarding/sports");
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: getErrorMessage(error, "Could not create account. Try again."),
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      router.replace("/(auth)/welcome");
    },
  });
}

export function useCompleteOnboarding() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: {
      sports: string[];
      sellChannels: string[];
      paymentMethods: { type: string; handle: string }[];
    }) => apiClient.post(ENDPOINTS.auth.onboarding, payload),
    onSuccess: () => {
      if (user) setAuth({ ...user, onboardingCompleted: true });
      reset();
      Toast.show({
        type: "success",
        text1: "Profile saved!",
        text2: "You're all set.",
      });
      router.push("/(auth)/onboarding/tutorial");
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Couldn't save profile",
        text2: getErrorMessage(error, "Please try again."),
      });
    },
  });
}
