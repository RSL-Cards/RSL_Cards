import { Tabs, Redirect } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { name: "index", icon: "home", label: "Home" },
    { name: "inventory", icon: "cube", label: "Inventory" },
    null,
    { name: "reports", icon: "stats-chart", label: "Reports" },
    { name: "more", icon: "ellipsis-horizontal", label: "More" },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: insets.bottom || 16,
        paddingTop: 8,
        paddingHorizontal: 8,
      }}
    >
      {tabs.map((tab, index) => {
        if (tab === null) {
          return (
            <TouchableOpacity
              key="buy-center"
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -20,
              }}
              onPress={() => router.push("/buy/scan")}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  ...SHADOWS.glowPrimary,
                }}
              >
                <Typography variant="h2" weight="900" color={COLORS.white}>+</Typography>
              </View>
              <Typography variant="label" color={COLORS.zinc500} style={{ marginTop: 4 }}>
                BUY
              </Typography>
            </TouchableOpacity>
          );
        }

        const routeIndex = state.routes.findIndex(
          (r: any) => r.name === tab.name,
        );
        const isActive = state.index === routeIndex;

        return (
          <TouchableOpacity
            key={tab.name}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
            }}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Ionicons
              name={isActive ? (tab.icon as any) : (`${tab.icon}-outline` as any)}
              size={22}
              color={isActive ? COLORS.primary : COLORS.zinc500}
            />
            <Typography
              variant="label"
              weight={isActive ? "700" : "500"}
              color={isActive ? COLORS.primary : COLORS.zinc500}
              style={{ marginTop: 4, letterSpacing: 0, textTransform: 'none' }}
            >
              {tab.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (isHydrated && !isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
