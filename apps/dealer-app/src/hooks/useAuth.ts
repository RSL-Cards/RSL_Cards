import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import {
  authService,
  type LoginPayload,
  type RegisterPayload,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
} from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { useOnboardingStore } from "../stores/onboardingStore";
import { tokenStorage } from "../lib/tokenStorage";
import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

let GoogleSignin: any = null;
try {
  const mod = require("@react-native-google-signin/google-signin");
  GoogleSignin = mod.GoogleSignin;
  if (GoogleSignin?.configure) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }
} catch (e) {
  console.warn("[GoogleAuth] Native GoogleSignin module not available in Expo Go.");
}

WebBrowser.maybeCompleteAuthSession();
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
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
    }) =>
      apiClient
        .post(ENDPOINTS.auth.onboarding, payload)
        .then((r) => ({ ...r, _payload: payload })),
    onSuccess: (res: any) => {
      const updatedUser = {
        ...user,
        onboardingCompleted: true,
        sports: res._payload?.sports ?? user?.sports ?? [],
        sellChannels: res._payload?.sellChannels ?? user?.sellChannels ?? [],
      };
      if (user) setAuth(updatedUser as any);
      tokenStorage.setUser(updatedUser as any);
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

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword(payload),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "OTP sent!",
        text2: "Check your email for the reset code.",
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to send OTP",
        text2: getErrorMessage(error, "Please try again."),
      });
    },
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authService.resetPassword(payload),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Password reset!",
        text2: "You can now log in with your new password.",
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Reset failed",
        text2: getErrorMessage(error, "Invalid or expired OTP."),
      });
    },
  });
}

export function useGoogleAuth() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const handleBackendGoogleLogin = async (idToken: string) => {
    try {
      const data = await authService.googleLogin({ idToken });
      setAuth(data.user);

      Toast.show({
        type: "success",
        text1: "Signed in with Google",
      });

      if (!data.user.onboardingCompleted) {
        router.replace("/(auth)/onboarding/sports");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("[GoogleAuth] backend login error:", error);
      Toast.show({
        type: "error",
        text1: "Google sign in failed",
        text2: getErrorMessage(error, "Could not sign in with Google."),
      });
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params?.id_token || response.authentication?.idToken;
      if (idToken) {
        handleBackendGoogleLogin(idToken);
      }
    }
  }, [response]);

  const promptGoogleSignIn = async () => {
    try {
      if (GoogleSignin && GoogleSignin.signIn) {
        await GoogleSignin.hasPlayServices();
        const res = await GoogleSignin.signIn();
        const idToken = res.data?.idToken || res.idToken;
        if (idToken) {
          return handleBackendGoogleLogin(idToken);
        }
      }
    } catch (error: any) {
      console.log("[GoogleAuth] Native GoogleSignin unavailable/failed, using AuthSession fallback:", error);
    }

    if (promptAsync) {
      promptAsync();
    } else {
      Toast.show({
        type: "error",
        text1: "Google Auth Unavailable",
        text2: "Google sign-in request is initializing, please try again.",
      });
    }
  };

  return {
    promptGoogleSignIn,
    request: true,
  };
}

export function useAppleAuth() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) return;

      const data = await authService.appleLogin({
        idToken: credential.identityToken,
      });

      setAuth(data.user);

      if (!data.user.onboardingCompleted) {
        router.replace("/(auth)/onboarding/sports");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Apple sign in failed",
      });
    }
  };

  return {
    signInWithApple,
  };
}
