import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { name: "index", icon: "🏠", label: "Home" },
    { name: "inventory", icon: "📦", label: "Inventory" },
    null,
    { name: "reports", icon: "📊", label: "Reports" },
    { name: "more", icon: "⋯", label: "More" },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000000",
        borderTopWidth: 1,
        borderTopColor: "#2A2A2A",
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
                  backgroundColor: "#0057FF",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#0057FF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.6,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 28, fontWeight: "900" }}
                >
                  +
                </Text>
              </View>
              <Text style={{ color: "#555555", fontSize: 10, marginTop: 4 }}>
                BUY
              </Text>
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
            <Text style={{ fontSize: 22 }}>{tab.icon}</Text>
            <Text
              style={{
                color: isActive ? "#E8001C" : "#555555",
                fontSize: 10,
                marginTop: 2,
                fontWeight: isActive ? "700" : "400",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
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
