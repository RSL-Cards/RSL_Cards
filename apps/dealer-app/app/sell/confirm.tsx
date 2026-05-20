import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useAuthStore } from "../../src/stores/authStore";
import { apiClient } from "../../src/lib/apiClient";
import { ENDPOINTS } from "../../src/config/api";
import Toast from "react-native-toast-message";

const STEP_PCT = "100%";

const PAYMENT_ICON_MAP: Record<string, { name: string; color: string }> = {
  cash: { name: "cash-outline", color: "#00C853" },
  venmo: { name: "wallet-outline", color: "#008CFF" },
  zelle: { name: "card-outline", color: "#6C1CD1" },
  paypal: { name: "logo-paypal", color: "#003087" },
  cashapp: { name: "logo-usd", color: "#00D632" },
  trade: { name: "swap-horizontal-outline", color: "#888888" },
  other: { name: "card-outline", color: "#888888" },
};

export default function SellConfirmScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tabs = useDealTabStore((s) => s.tabs);
  const removeTab = useDealTabStore((s) => s.removeTab);
  const activeTab = tabs[tabs.length - 1];
  const card = activeTab?.cardData;

  const sellPrice = activeTab?.price ?? 0;
  const costBasis = parseFloat(card?.cost_basis ?? card?.costBasis ?? "0");
  const paymentMethod = activeTab?.paymentMethod ?? null;
  const channel = activeTab?.channel ?? "card_show";
  const inventoryId = card?.id ?? null;
  const gradeKey = card?.grade_key ?? card?.gradeKey ?? "RAW";
  const playerName = card?.player_name ?? "Unknown Card";

  const profit = sellPrice - costBasis;
  const profitPct = costBasis > 0 ? Math.round((profit / costBasis) * 100) : 0;
  const isProfit = profit >= 0;

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.3))[0];

  useEffect(() => {
    if (confirmed) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => {
        if (activeTab?.id) removeTab(activeTab.id);
        router.replace("/(tabs)");
      }, 1800);
    }
  }, [confirmed]);

  const handleConfirmSale = async () => {
    if (!playerName || !sellPrice) return;
    setSubmitting(true);

    try {
      await apiClient.post(ENDPOINTS.transactions.sell, {
        inventoryId,
        playerName,
        price: String(sellPrice),
        costBasis: String(costBasis),
        channel,
        paymentMethod,
        gradeKey,
        cardSnapshot: JSON.stringify(card),
      });

      // Invalidate analytics & inventory caches so home screen updates
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["analytics", "daily", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["analytics", "today-activity", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["inventory", userId],
        });
      }

      setConfirmed(true);
    } catch (err: any) {
      console.error("[SELL CONFIRM] error:", err?.response?.data ?? err);
      Toast.show({
        type: "error",
        text1: "Sale failed",
        text2:
          err?.response?.data?.message ?? "Could not record sale. Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success overlay ──
  if (confirmed) {
    return (
      <Animated.View style={[styles.successOverlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}
        >
          <Ionicons name="checkmark-sharp" size={56} color="white" />
        </Animated.View>
        <Text style={styles.successTitle}>Sale Complete!</Text>
        <Text style={styles.successSub}>Profit recorded</Text>
        <View
          style={[
            styles.successProfitPill,
            {
              backgroundColor: isProfit
                ? "rgba(0,200,83,0.15)"
                : "rgba(232,0,28,0.15)",
              borderColor: isProfit
                ? "rgba(0,200,83,0.3)"
                : "rgba(232,0,28,0.3)",
            },
          ]}
        >
          <Text
            style={[
              styles.successProfitText,
              { color: isProfit ? "#00C853" : "#E8001C" },
            ]}
          >
            {isProfit ? "+" : ""}${profit.toFixed(0)} · {profitPct}%
          </Text>
        </View>
      </Animated.View>
    );
  }

  // ── Main confirm screen ──
  const initials =
    playerName
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2) ?? "?";

  const pmConfig = PAYMENT_ICON_MAP[paymentMethod ?? ""] ?? PAYMENT_ICON_MAP.other;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELL — Step 5 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardThumb}>
            <Text style={{ color: "#555555", fontSize: 24, fontWeight: "900" }}>
              {initials}
            </Text>
          </View>
          <Text style={styles.cardName}>{playerName}</Text>
          <Text style={{ color: "#888888", fontSize: 12, marginBottom: 8 }}>
            {card?.year}
            {card?.set_name ? ` · ${card.set_name}` : ""}
          </Text>
          <View style={styles.gradePill}>
            <Text style={styles.gradePillText}>
              {(gradeKey ?? "RAW").replace("_", " ")}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.priceLabel}>SALE PRICE</Text>
          <Text style={styles.priceValue}>${sellPrice}</Text>

          {/* Profit hero */}
          <View
            style={[
              styles.profitHero,
              {
                backgroundColor: isProfit
                  ? "rgba(0,200,83,0.12)"
                  : "rgba(232,0,28,0.12)",
                borderColor: isProfit
                  ? "rgba(0,200,83,0.3)"
                  : "rgba(232,0,28,0.3)",
              },
            ]}
          >
            <Text
              style={[
                styles.profitLabel,
                { color: isProfit ? "#00C853" : "#E8001C" },
              ]}
            >
              {isProfit ? "PROFIT" : "LOSS"}
            </Text>
            <Text
              style={[
                styles.profitValue,
                { color: isProfit ? "#00C853" : "#E8001C" },
              ]}
            >
              {isProfit ? "+" : ""}${profit.toFixed(0)}
            </Text>
            <Text
              style={[
                styles.profitPct,
                { color: isProfit ? "#00C853" : "#E8001C" },
              ]}
            >
              {isProfit ? "+" : ""}
              {profitPct}% margin
            </Text>
          </View>

          {/* Payment method */}
          {paymentMethod && (
            <View style={styles.methodRow}>
              <Ionicons
                name={pmConfig.name as any}
                size={20}
                color={pmConfig.color}
              />
              <Text style={styles.methodText}>
                {paymentMethod.charAt(0).toUpperCase() +
                  paymentMethod.slice(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />

        {/* Confirm */}
        <TouchableOpacity
          style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
          disabled={submitting}
          onPress={handleConfirmSale}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmBtnText}>CONFIRM SALE</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: "center", marginTop: 16 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#555555", fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backText: { color: "white", fontSize: 28 },
  headerTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  progressBar: { height: 3, backgroundColor: "#1A1A1A" },
  progressFill: { height: 3, backgroundColor: "#E8001C" },
  summaryCard: {
    backgroundColor: "#111111",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
  },
  cardThumb: {
    width: 80,
    height: 110,
    backgroundColor: "#222222",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardName: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  gradePill: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  gradePillText: { color: "#000", fontSize: 12, fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    width: "100%",
    marginVertical: 20,
  },
  priceLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  priceValue: {
    color: "white",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 12,
  },
  profitHero: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
  },
  profitLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  profitValue: { fontSize: 40, fontWeight: "900" },
  profitPct: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  methodText: { color: "#888888", fontSize: 14 },
  confirmBtn: {
    backgroundColor: "#E8001C",
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8001C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: { color: "white", fontSize: 28, fontWeight: "700" },
  successSub: { color: "#888888", fontSize: 16, marginTop: 8 },
  successProfitPill: {
    marginTop: 20,
    borderRadius: 100,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderWidth: 1,
  },
  successProfitText: { fontSize: 24, fontWeight: "900" },
});
