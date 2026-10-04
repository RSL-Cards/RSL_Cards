import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, LogBox, Text, TouchableOpacity, StyleSheet } from "react-native";

LogBox.ignoreAllLogs();

import { QueryProvider } from "../src/providers/QueryProvider";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../src/stores/authStore";
import { toastConfig } from "../src/components/ToastConfig";
import { AskRslFab } from "../src/components/assistant/AskRslFab";
import { AssistantModal } from "../src/components/assistant/AssistantModal";
import { GlobalSSEProvider } from "../src/components/GlobalSSEProvider";
import { COLORS } from "../src/constants/theme";
import RSLLoader from "../src/components/RSLLoader";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { apiClient } from "../src/lib/apiClient";

/**
 * Prevent unhandled JS fatals from escalating into native SIGABRT via
 * expo-updates ErrorRecovery (queue: expo.controller.errorRecoveryQueue).
 * App Review build 38 crashed exclusively on that queue.
 */
if (typeof ErrorUtils !== "undefined") {
  const originalHandler =
    ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.warn(
      "[GlobalErrorHandler]",
      error?.message || error,
      "isFatal:",
      isFatal
    );
    // Never rethrow fatals into native abort handlers during cold launch.
    if (!isFatal && originalHandler) {
      try {
        originalHandler(error, isFatal);
      } catch {
        // swallow
      }
    }
  });
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    const firstSegment = segments[0];
    // Allow root index + auth group to own first-paint routing.
    // Do not race Redirect in app/index.tsx with a replace() here.
    const isRootOrAuth =
      !firstSegment || firstSegment === "index" || firstSegment === "(auth)";
    if (!isAuthenticated && !isRootOrAuth) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isHydrated, segments, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const user = useAuthStore.getState().user;

    // Defer push/OneSignal until after first UI paint to avoid native queue
    // contention during App Review cold launches.
    const timer = setTimeout(() => {
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTz) {
          apiClient
            .patch("/v1/users/me/notification-preferences", { timezone: userTz })
            .catch(() => {});
        }
      } catch {
        // non-fatal
      }

      import("../src/services/notificationService")
        .then(({ notificationService }) => {
          notificationService
            .registerForPushNotificationsAsync()
            .catch(() => {});
          if (user?.id) {
            notificationService.setOneSignalUser(user.id);
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return <>{children}</>;
}

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <View style={styles.errorRoot}>
      <Text style={styles.errorTitle}>RSL Cards</Text>
      <Text style={styles.errorBody}>
        An unexpected error occurred. Please tap below to reload.
      </Text>
      {!!error?.message && (
        <Text style={styles.errorDetail} numberOfLines={3}>
          {error.message}
        </Text>
      )}
      <TouchableOpacity
        onPress={retry}
        activeOpacity={0.8}
        style={styles.errorBtn}
      >
        <Text style={styles.errorBtnText}>Reload App</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const ready = fontsLoaded || !!fontError;

  // Never return null — blank root trees race expo-router and can fatal.
  if (!ready) {
    return (
      <View style={styles.bootRoot}>
        <RSLLoader size={80} />
      </View>
    );
  }

  return (
    <QueryProvider>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="light" />
        <GlobalSSEProvider>
          <AuthGuard>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="buy"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="sell"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="inventory/[id]"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="listings/index"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="listings/create"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen
                name="notifications/index"
                options={{ animation: "slide_from_right" }}
              />
            </Stack>
          </AuthGuard>
        </GlobalSSEProvider>
        {isAuthenticated && (
          <AskRslFab onPress={() => setIsAssistantOpen(true)} />
        )}
        {isAuthenticated && (
          <AssistantModal
            visible={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
          />
        )}
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  bootRoot: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  errorRoot: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  errorBody: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  errorDetail: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
  },
  errorBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
