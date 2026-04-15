import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
} from "react-native";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  MOCK_TODAY_STATS,
  MOCK_AI_NARRATIVE,
  MOCK_INVENTORY_SUMMARY,
} from "../../src/constants/mockData";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useAuthStore } from "../../src/stores/authStore";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initials = (user?.displayName ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const tabs = useDealTabStore((s) => s.tabs);
  const removeTab = useDealTabStore((s) => s.removeTab);

  const buyScale = useRef(new Animated.Value(1)).current;
  const sellScale = useRef(new Animated.Value(1)).current;

  const buyStyle = { transform: [{ scale: buyScale }] };
  const sellStyle = { transform: [{ scale: sellScale }] };

  const handleBuy = () => {
    Animated.sequence([
      Animated.spring(buyScale, {
        toValue: 0.93,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(buyScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();
    router.push("/buy/scan");
  };

  const handleSell = () => {
    Animated.sequence([
      Animated.spring(sellScale, {
        toValue: 0.93,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(sellScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();
    router.push("/sell/scan");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── HEADER ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                borderWidth: 1.5,
                borderColor: "white",
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.3)",
                  marginBottom: 2,
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "900",
                  fontStyle: "italic",
                }}
              >
                RSL
              </Text>
              <Text
                style={{
                  color: "#E8001C",
                  fontSize: 8,
                  fontWeight: "700",
                  letterSpacing: 3,
                }}
              >
                CARDS
              </Text>
            </View>
            <Text
              style={{ color: "#555555", fontSize: 12, fontStyle: "italic" }}
            >
              Pro
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity
              onPress={() => router.push("/notifications/index")}
              style={{ position: "relative" }}
            >
              <Text style={{ fontSize: 22 }}>🔔</Text>
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: "#E8001C",
                  borderRadius: 8,
                  width: 16,
                  height: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 9, fontWeight: "700" }}
                >
                  2
                </Text>
              </View>
            </TouchableOpacity>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#E8001C",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>
                {initials}
              </Text>
            </View>
          </View>
        </View>

        {/* ── TODAY STATS BAR ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 10,
            paddingVertical: 8,
          }}
        >
          {[
            {
              label: "Bought",
              value: `${MOCK_TODAY_STATS.cards_bought}`,
              unit: "cards",
              color: "#0057FF",
            },
            {
              label: "Sold",
              value: `${MOCK_TODAY_STATS.cards_sold}`,
              unit: "cards",
              color: "#E8001C",
            },
            {
              label: "Spent",
              value: `$${MOCK_TODAY_STATS.total_spent}`,
              unit: "",
              color: "#888888",
            },
            {
              label: "Revenue",
              value: `$${MOCK_TODAY_STATS.total_revenue}`,
              unit: "",
              color: "#FFFFFF",
            },
            {
              label: "Profit",
              value: `$${MOCK_TODAY_STATS.net_profit}`,
              unit: "",
              color: "#00C853",
            },
          ].map((stat) => (
            <TouchableOpacity
              key={stat.label}
              onPress={() => router.push("/reports/daily")}
              style={{
                backgroundColor: "#111111",
                borderRadius: 14,
                padding: 14,
                minWidth: 90,
                borderWidth: 1,
                borderColor: "#2A2A2A",
              }}
            >
              <Text
                style={{
                  color: "#888888",
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                {stat.label.toUpperCase()}
              </Text>
              <Text
                style={{ color: stat.color, fontSize: 18, fontWeight: "700" }}
              >
                {stat.value}
              </Text>
              {stat.unit ? (
                <Text style={{ color: "#555555", fontSize: 10 }}>
                  {stat.unit}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── BUY / SELL BUTTONS (HERO) ── */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 20,
            marginTop: 8,
          }}
        >
          <Animated.View style={[{ flex: 1 }, buyStyle]}>
            <Pressable
              onPress={handleBuy}
              style={{
                height: 160,
                borderRadius: 20,
                backgroundColor: "#0057FF",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#0057FF",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 46,
                  fontWeight: "900",
                  fontStyle: "italic",
                  lineHeight: 50,
                }}
              >
                BUY
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                Buy a card
              </Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={[{ flex: 1 }, sellStyle]}>
            <Pressable
              onPress={handleSell}
              style={{
                height: 160,
                borderRadius: 20,
                backgroundColor: "#E8001C",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#E8001C",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 46,
                  fontWeight: "900",
                  fontStyle: "italic",
                  lineHeight: 50,
                }}
              >
                SELL
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                Sell a card
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* ── ACTIVE DEAL TABS ── */}
        {tabs.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text
              style={{
                color: "#888888",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.5,
                paddingHorizontal: 20,
                marginBottom: 10,
              }}
            >
              ACTIVE DEALS
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={{
                    backgroundColor: "#111111",
                    borderRadius: 14,
                    padding: 14,
                    width: 160,
                    borderWidth: 1,
                    borderColor: "#2A2A2A",
                  }}
                  onPress={() =>
                    router.push(
                      tab.type === "buy" ? "/buy/comps" : "/sell/select",
                    )
                  }
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {tab.cardData?.player_name || "Unknown Card"}
                  </Text>
                  <Text style={{ color: "#888888", fontSize: 11 }}>
                    Step {tab.step}/5 · {tab.type.toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    style={{ position: "absolute", top: 8, right: 8 }}
                    onPress={() => removeTab(tab.id)}
                  >
                    <Text style={{ color: "#555555", fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── AI INSIGHT CARD ── */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Text
            style={{
              color: "#888888",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            AI INSIGHT
          </Text>
          <View
            style={{
              backgroundColor: "#111111",
              borderRadius: 16,
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: "#E8001C",
              borderWidth: 1,
              borderColor: "#2A2A2A",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>⚡</Text>
              <Text
                style={{
                  color: "#E8001C",
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                {MOCK_AI_NARRATIVE.narrative_type.toUpperCase()}
              </Text>
              <View style={{ marginLeft: "auto" }}>
                <Text
                  style={{ color: "#00C853", fontSize: 13, fontWeight: "700" }}
                >
                  +{MOCK_AI_NARRATIVE.price_change_pct}%
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              {MOCK_AI_NARRATIVE.headline}
            </Text>
            <Text style={{ color: "#888888", fontSize: 13, lineHeight: 19 }}>
              {MOCK_AI_NARRATIVE.short_summary}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#555555", fontSize: 12 }}>
                {MOCK_AI_NARRATIVE.affected_in_inventory} cards in your
                inventory affected
              </Text>
            </View>
          </View>
        </View>

        {/* ── INVENTORY SNAPSHOT ── */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: "#888888",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.5,
              }}
            >
              INVENTORY
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/inventory")}>
              <Text style={{ color: "#0057FF", fontSize: 13 }}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: "#111111",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {[
                {
                  label: "Cards",
                  value: `${MOCK_INVENTORY_SUMMARY.total_cards}`,
                },
                {
                  label: "Value",
                  value: `$${MOCK_INVENTORY_SUMMARY.total_market_value.toLocaleString()}`,
                },
                {
                  label: "Gain",
                  value: `+$${MOCK_INVENTORY_SUMMARY.total_unrealized_gain}`,
                },
              ].map((item) => (
                <View key={item.label} style={{ alignItems: "center" }}>
                  <Text
                    style={{ color: "#888888", fontSize: 11, marginBottom: 4 }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      color: item.label === "Gain" ? "#00C853" : "white",
                      fontSize: 17,
                      fontWeight: "700",
                    }}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
            {MOCK_INVENTORY_SUMMARY.aging_alerts_count > 0 && (
              <View
                style={{
                  marginTop: 14,
                  backgroundColor: "rgba(255, 179, 0, 0.1)",
                  borderRadius: 10,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: "rgba(255,179,0,0.3)",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>⏰</Text>
                <Text style={{ color: "#FFB300", fontSize: 13 }}>
                  {MOCK_INVENTORY_SUMMARY.aging_alerts_count} cards need
                  attention (60+ days)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── TODAY'S ACTIVITY ── */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Text
            style={{
              color: "#888888",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              marginBottom: 10,
            }}
          >
            TODAY'S ACTIVITY
          </Text>
          <View
            style={{
              backgroundColor: "#111111",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              overflow: "hidden",
            }}
          >
            {[
              {
                type: "sell",
                player: "CJ Stroud",
                price: "$198",
                profit: "+$42",
                time: "9:15 AM",
              },
              {
                type: "buy",
                player: "Josh Allen",
                price: "$389",
                profit: null,
                time: "10:30 AM",
              },
              {
                type: "sell",
                player: "Jayden Daniels",
                price: "$58",
                profit: "+$23",
                time: "11:45 AM",
              },
            ].map((tx, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 14,
                  borderBottomWidth: i < 2 ? 1 : 0,
                  borderBottomColor: "#2A2A2A",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor:
                      tx.type === "buy"
                        ? "rgba(0,87,255,0.15)"
                        : "rgba(232,0,28,0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: tx.type === "buy" ? "#0057FF" : "#E8001C",
                    }}
                  >
                    {tx.type === "buy" ? "B" : "S"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: "white", fontWeight: "600", fontSize: 14 }}
                  >
                    {tx.player}
                  </Text>
                  <Text
                    style={{ color: "#555555", fontSize: 11, marginTop: 2 }}
                  >
                    {tx.time}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                  >
                    {tx.price}
                  </Text>
                  {tx.profit && (
                    <Text
                      style={{ color: "#00C853", fontSize: 12, marginTop: 2 }}
                    >
                      {tx.profit}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
