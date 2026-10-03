import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, LogBox } from "react-native";

LogBox.ignoreAllLogs();
import { QueryProvider } from "../src/providers/QueryProvider";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../src/stores/authStore";

import { toastConfig } from "../src/components/ToastConfig";
import { AskRslFab } from "../src/components/assistant/AskRslFab";
import { AssistantModal } from "../src/components/assistant/AssistantModal";
import { GlobalSSEProvider } from "../src/components/GlobalSSEProvider";
import { COLORS } from "../src/constants/theme";
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

import { Text, TouchableOpacity } from "react-native";

// Global JS error guard to prevent unhandled JS errors from triggering fatal native aborts
if (typeof ErrorUtils !== "undefined") {
  const originalHandler = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.warn("[GlobalErrorHandler] Caught JS error:", error?.message || error, "isFatal:", isFatal);
    if (!isFatal && originalHandler) {
      originalHandler(error, isFatal);
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
    const isRootOrAuth = !firstSegment || firstSegment === "index" || firstSegment === "(auth)";
    if (!isAuthenticated && !isRootOrAuth) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isHydrated, segments]);

  useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      
      // Auto-sync device timezone on app load
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTz) {
          apiClient.patch("/v1/users/me/notification-preferences", { timezone: userTz })
            .then(() => console.log(`[TimezoneSync] Successfully synced device timezone: ${userTz}`))
            .catch((err) => console.error("[TimezoneSync] Failed to sync timezone to backend:", err));
        }
      } catch (tzErr) {
        console.error("[TimezoneSync] Error resolving device timezone:", tzErr);
      }

      import("../src/services/notificationService").then(({ notificationService }) => {
        notificationService.registerForPushNotificationsAsync().catch(console.error);
        if (user?.id) {
          notificationService.setOneSignalUser(user.id);
        }
      });
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        RSL Cards
      </Text>
      <Text style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
        An unexpected error occurred. Please tap below to reload.
      </Text>
      <TouchableOpacity
        onPress={retry}
        activeOpacity={0.8}
        style={{ backgroundColor: "#2563eb", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>Reload App</Text>
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

  if (!fontsLoaded && !fontError) {
    return null;
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
        {isAuthenticated && <AskRslFab onPress={() => setIsAssistantOpen(true)} />}
        {isAuthenticated && <AssistantModal visible={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />}
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </QueryProvider>
  );
}
