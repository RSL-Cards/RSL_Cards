import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { QueryProvider } from "../src/providers/QueryProvider";
import { AuthErrorBoundary } from "../src/components/ServiceErrorBoundary";

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000000" }}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#000000" },
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
                name="listings/create"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen
                name="notifications/index"
                options={{ animation: "slide_from_right" }}
              />
            </Stack>
          </SafeAreaProvider>
          <Toast />
        </GestureHandlerRootView>
      </AuthErrorBoundary>
    </QueryProvider>
  );
}
