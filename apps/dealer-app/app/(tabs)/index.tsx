import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MOCK_AI_NARRATIVE, MOCK_NOTIFICATIONS } from "../../src/constants/mockData";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useAuthStore } from "../../src/stores/authStore";
import {
  useDailyStats,
  useTodayActivity,
  useRefetchDashboardOnFocus,
} from "../../src/hooks/useDashboard";
import { useInventorySummary } from "../../src/hooks/useCardScan";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";
import { Button } from "../../src/components/ui/Button";

export default function HomeScreen() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const user = useAuthStore((s) => s.user);
  const initials = (user?.displayName ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const tabs = useDealTabStore((s) => s.tabs);
  const removeTab = useDealTabStore((s) => s.removeTab);

  const { data: dailyStats } = useDailyStats();
  const { data: summary } = useInventorySummary();
  const { data: todayActivity } = useTodayActivity();
  useRefetchDashboardOnFocus();

  const handleBuy = () => router.push("/buy/scan");
  const handleSell = () => router.push("/sell/scan");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
      >
        {/* ── HEADER ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <Image
              source={require("../../assets/rslicon.jpeg")}
              style={{ width: 44, height: 44, borderRadius: RADIUS.sm }}
              resizeMode="contain"
            />
            <Typography variant="label" color={COLORS.zinc400} style={{ fontStyle: 'italic' }}>PRO</Typography>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
            <TouchableOpacity onPress={() => setShowNotifications(true)} style={{ position: "relative" }}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.zinc100} />
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: COLORS.destructive,
                  borderRadius: RADIUS.full,
                  width: 16,
                  height: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" weight="800" color={COLORS.white} style={{ fontSize: 9 }}>
                  2
                </Typography>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/more")}
              style={{
                width: 36,
                height: 36,
                borderRadius: RADIUS.full,
                backgroundColor: COLORS.zinc800,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              {user?.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <Typography variant="body" weight="700" color={COLORS.zinc100}>
                  {initials}
                </Typography>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── TODAY STATS BAR ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            gap: SPACING.sm,
            paddingVertical: SPACING.sm,
          }}
        >
          {[
            { label: "Bought", value: `${dailyStats?.cards_bought ?? 0}`, unit: "cards", color: COLORS.primaryLight },
            { label: "Sold", value: `${dailyStats?.cards_sold ?? 0}`, unit: "cards", color: COLORS.destructive },
            { label: "Spent", value: `$${dailyStats?.total_spent ?? "0.00"}`, color: COLORS.zinc400 },
            { label: "Revenue", value: `$${dailyStats?.total_revenue ?? "0.00"}`, color: COLORS.zinc50 },
            { label: "Profit", value: `$${dailyStats?.net_profit ?? "0.00"}`, color: COLORS.success },
          ].map((stat) => (
            <TouchableOpacity key={stat.label} onPress={() => router.push("/reports/daily")}>
              <Surface variant="glass" padding="md" style={{ minWidth: 100 }}>
                <Typography variant="label" color={COLORS.zinc400} style={{ marginBottom: SPACING.xs }}>
                  {stat.label}
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs }}>
                  <Typography variant="h3" weight="800" color={stat.color}>
                    {stat.value}
                  </Typography>
                  {stat.unit && <Typography variant="caption" color={COLORS.zinc500}>{stat.unit}</Typography>}
                </View>
              </Surface>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── BUY / SELL BUTTONS (HERO) ── */}
        <View style={{ flexDirection: "row", gap: SPACING.md, paddingHorizontal: SPACING.lg, marginTop: SPACING.md }}>
          <Button
            label="Buy"
            variant="primary"
            size="hero"
            onPress={handleBuy}
            style={{ flex: 1 }}
          />
          <Button
            label="Sell"
            variant="destructive"
            size="hero"
            onPress={handleSell}
            style={{ flex: 1 }}
          />
        </View>

        {/* ── ACTIVE DEAL TABS ── */}
        {tabs.length > 0 && (
          <View style={{ marginTop: SPACING.xl }}>
            <Typography variant="label" color={COLORS.zinc500} style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm }}>
              ACTIVE DEALS
            </Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: SPACING.md }}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => {
                    useDealTabStore.getState().setActiveTab(tab.id);
                    router.push(tab.type === "buy" ? "/buy/comps" : "/sell/price");
                  }}
                >
                  <Surface variant="glass" padding="md" style={{ width: 180 }}>
                    <Typography variant="body" weight="600" numberOfLines={1} style={{ marginBottom: SPACING.xs }}>
                      {tab.cardData?.player_name || "Unknown Card"}
                    </Typography>
                    <Typography variant="caption" color={COLORS.zinc400}>
                      Step {tab.step}/5 · {tab.type.toUpperCase()}
                    </Typography>
                    <TouchableOpacity style={{ position: "absolute", top: SPACING.sm, right: SPACING.sm, padding: 4 }} onPress={() => removeTab(tab.id)}>
                      <Ionicons name="close" size={16} color={COLORS.zinc400} />
                    </TouchableOpacity>
                  </Surface>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── AI INSIGHT CARD ── */}
        <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
          <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
            AI INSIGHT
          </Typography>
          <Surface variant="elevated" padding="lg" style={{ borderLeftWidth: 3, borderLeftColor: COLORS.primary }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
              <Ionicons name="flash" size={16} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
              <Typography variant="label" color={COLORS.primaryLight}>
                {MOCK_AI_NARRATIVE.narrative_type}
              </Typography>
              <View style={{ marginLeft: "auto" }}>
                <Typography variant="body" weight="700" color={COLORS.success}>
                  +{MOCK_AI_NARRATIVE.price_change_pct}%
                </Typography>
              </View>
            </View>
            <Typography variant="h3" weight="800" style={{ marginBottom: SPACING.xs }}>
              {MOCK_AI_NARRATIVE.headline}
            </Typography>
            <Typography variant="body" color={COLORS.zinc400} style={{ marginBottom: SPACING.md }}>
              {MOCK_AI_NARRATIVE.short_summary}
            </Typography>
            <Typography variant="caption" color={COLORS.zinc500}>
              {MOCK_AI_NARRATIVE.affected_in_inventory} cards in your inventory affected
            </Typography>
          </Surface>
        </View>

        {/* ── INVENTORY SNAPSHOT ── */}
        <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
            <Typography variant="label" color={COLORS.zinc500}>INVENTORY</Typography>
            <TouchableOpacity onPress={() => router.push("/(tabs)/inventory")}>
              <Typography variant="body" color={COLORS.primaryLight}>See all →</Typography>
            </TouchableOpacity>
          </View>
          <Surface padding="lg" variant="elevated">
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {[
                { label: "Cards", value: `${summary?.total_cards ?? 0}` },
                { label: "Value", value: `$${parseFloat(summary?.total_market_value ?? "0").toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
                {
                  label: "Gain",
                  value: `${parseFloat(summary?.total_unrealized_gain ?? "0") >= 0 ? "+" : "-"}$${Math.abs(parseFloat(summary?.total_unrealized_gain ?? "0")).toFixed(0)}`,
                  isNegative: parseFloat(summary?.total_unrealized_gain ?? "0") < 0,
                },
              ].map((item) => (
                <View key={item.label} style={{ alignItems: "center" }}>
                  <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.xs }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h3" weight="800" color={item.label === "Gain" ? (item.isNegative ? COLORS.destructive : COLORS.success) : COLORS.zinc50}>
                    {item.value}
                  </Typography>
                </View>
              ))}
            </View>
          </Surface>
        </View>

        {/* ── TODAY'S ACTIVITY ── */}
        {todayActivity && todayActivity.length > 0 && (
          <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
              TODAY'S ACTIVITY
            </Typography>
            <Surface padding="none" variant="elevated">
              {todayActivity.map((tx, i) => (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: SPACING.md,
                    borderBottomWidth: i < todayActivity.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.sm,
                      backgroundColor: tx.type === "buy" ? 'rgba(79,70,229,0.15)' : 'rgba(225,29,72,0.15)',
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: SPACING.md,
                    }}
                  >
                    <Typography variant="body" weight="800" color={tx.type === "buy" ? COLORS.primaryLight : COLORS.destructive}>
                      {tx.type === "buy" ? "B" : tx.type === "sell" ? "S" : "T"}
                    </Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="body" weight="600" numberOfLines={1}>
                      {tx.playerName}
                    </Typography>
                    <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 2 }}>
                      {tx.time}
                    </Typography>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Typography variant="body" weight="700">
                      ${tx.price}
                    </Typography>
                    {tx.profit && (
                      <Typography variant="caption" weight="600" color={parseFloat(tx.profit) >= 0 ? COLORS.success : COLORS.destructive} style={{ marginTop: 2 }}>
                        {parseFloat(tx.profit) >= 0 ? "+" : ""}${tx.profit}
                      </Typography>
                    )}
                  </View>
                </View>
              ))}
            </Surface>
          </View>
        )}
      </ScrollView>

      <Modal visible={showNotifications} transparent={true} animationType="fade" onRequestClose={() => setShowNotifications(false)}>
        <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: "absolute",
                  top: 70,
                  right: SPACING.lg,
                  width: 320,
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...SHADOWS.lg,
                }}
              >
                <Typography variant="h3" weight="800" style={{ marginBottom: SPACING.md }}>
                  Notifications
                </Typography>
                {MOCK_NOTIFICATIONS.map((n, idx) => (
                  <TouchableOpacity
                    key={n.id}
                    style={{
                      flexDirection: "row",
                      gap: SPACING.sm,
                      paddingVertical: SPACING.md,
                      borderTopWidth: idx > 0 ? 1 : 0,
                      borderTopColor: COLORS.border,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: RADIUS.full,
                        backgroundColor: n.type === "sale" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name={n.type === "sale" ? "cash-outline" : "warning-outline"} size={20} color={n.type === "sale" ? COLORS.success : COLORS.warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" weight="700" style={{ marginBottom: SPACING.xs }}>
                        {n.title}
                      </Typography>
                      <Typography variant="caption" color={COLORS.zinc400}>
                        {n.body}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
