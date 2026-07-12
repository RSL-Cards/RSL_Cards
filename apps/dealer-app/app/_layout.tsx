import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
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

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    }
  }, [isAuthenticated, isHydrated, segments]);

  useEffect(() => {
    if (isAuthenticated) {
      // Register for push notifications dynamically
      import("../src/services/notificationService").then(({ notificationService }) => {
        notificationService.registerForPushNotificationsAsync().catch(console.error);
      });
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
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
