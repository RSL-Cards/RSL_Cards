import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../src/stores/authStore";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useAddToInventory } from "../../src/hooks/useCardScan";
import { apiClient } from "../../src/lib/apiClient";
import { ENDPOINTS } from "../../src/config/api";
import * as FileSystem from "expo-file-system/legacy";
import { useActiveDailyLog } from "../../src/hooks/useDashboard";
import NetInfo from "@react-native-community/netinfo";
import { useSyncStore } from "../../src/stores/syncStore";
import Toast from "react-native-toast-message";

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵",
  venmo: "💜",
  zelle: "💙",
  paypal: "🅿️",
  cashapp: "💚",
  other: "💳",
};

const STEP_PCT = "100%";

async function uploadCardPhoto(inventoryId: string, base64Data: string) {
  try {
    const filename = `${inventoryId}_captured.jpg`;
    const tempUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(tempUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const formData = new FormData();
    formData.append("photo", {
      uri: tempUri,
      name: filename,
      type: "image/jpeg",
    } as any);

    await apiClient.post(`/v1/inventory/${inventoryId}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (err) {
    console.error("Photo upload failed:", err);
  }
}

export default function BuyConfirmScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tabs = useDealTabStore((s) => s.tabs);
  const removeTab = useDealTabStore((s) => s.removeTab);
  const { data: activeLog } = useActiveDailyLog();

  const activeTab = tabs[tabs.length - 1];
  const card = activeTab?.cardData;
  const price = activeTab?.price;
  const channel = activeTab?.channel || "card_show";
  const paymentMethod = activeTab?.paymentMethod;
  const capturedPhoto = activeTab?.capturedPhoto;

  const [confirmed, setConfirmed] = useState(false);
  const fadeAnim = useState(() => new Animated.Value(0))[0];

  const { mutate: addToInventory, isPending } = useAddToInventory();

  useEffect(() => {
    if (confirmed) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [confirmed]);

  const comps = activeTab?.comps;
  const avgComp = comps?.snapshots?.[0]?.avgSoldPrice;

  let pctOfComp: number | null = null;
  if (price && avgComp && avgComp > 0) {
    pctOfComp = Math.round((Number(price) / avgComp) * 100);
  }

  const initials = (card?.player_name ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const cardId = activeTab?.cardId;
  const variantId = activeTab?.variantId;

  const proceedToSave = () => {
    const dealRating =
      pctOfComp == null
        ? null
        : pctOfComp <= 75
          ? "good_deal"
          : pctOfComp <= 90
            ? "fair_price"
            : "overpaying";

    const gradeKey = card?.grading
      ? `${card.grading.company}_${card.grading.grade}`
      : "RAW";

    const payload = {
      cardId: cardId || undefined,
      variantId: variantId || undefined,
      playerId: activeTab?.playerId ?? "",
      playerName: card?.player_name ?? undefined,
      year: card?.year ? Number(card.year) : undefined,
      setName: card?.set_name ?? undefined,
      variation: card?.variation ?? undefined,
      cardNumber: card?.card_number ?? undefined,
      sport: card?.sport ?? undefined,
      gradeCompany: card?.grading?.company ?? undefined,
      gradeValue: card?.grading?.grade ?? undefined,
      gradeKey,
      certNumber: card?.grading?.cert_number ?? undefined,
      costBasis: price || 0,
      currentMarketValue: avgComp ?? undefined,
      notes: paymentMethod ? `Paid via ${paymentMethod}` : undefined,
      ebaySalesCompleted: activeTab?.recentSales ? JSON.stringify(activeTab.recentSales) : undefined,
      ebayActiveListings: activeTab?.activeListings ? JSON.stringify(activeTab.activeListings) : undefined,
      myslabsSalesCompleted: activeTab?.myslabsRecentSales ? JSON.stringify(activeTab.myslabsRecentSales) : undefined,
      myslabsActiveListings: activeTab?.myslabsActiveListings ? JSON.stringify(activeTab.myslabsActiveListings) : undefined,
      photos: (activeTab?.isExisting && activeTab?.cardData?.photos && activeTab.cardData.photos.length > 0)
        ? activeTab.cardData.photos
        : (capturedPhoto ? undefined : (activeTab?.bestMatchImageUrl ? [activeTab.bestMatchImageUrl] : undefined)),
      channel,
      paymentMethod: paymentMethod ?? null,
      dealRating,
      dailyLogId: activeLog?.id || null,
    };

    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        useSyncStore.getState().addPendingTransaction("buy", payload);
        Toast.show({
          type: "info",
          text1: "Saved Offline",
          text2: "Pending Sync — transaction will sync when online.",
        });
        setConfirmed(true);
        return;
      }

      // Online checkout path
      addToInventory(
        {
          cardId: payload.cardId,
          variantId: payload.variantId,
          playerId: payload.playerId,
          playerName: payload.playerName,
          year: payload.year,
          setName: payload.setName,
          variation: payload.variation,
          cardNumber: payload.cardNumber,
          sport: payload.sport,
          gradeCompany: payload.gradeCompany,
          gradeValue: payload.gradeValue,
          gradeKey: payload.gradeKey,
          certNumber: payload.certNumber,
          costBasis: payload.costBasis,
          currentMarketValue: payload.currentMarketValue,
          notes: payload.notes,
          ebaySalesCompleted: payload.ebaySalesCompleted,
          ebayActiveListings: payload.ebayActiveListings,
          myslabsSalesCompleted: payload.myslabsSalesCompleted,
          myslabsActiveListings: payload.myslabsActiveListings,
          photos: payload.photos,
        },
        {
          onSuccess: async (data: any) => {
            const inventoryId = data?.item?.id ?? null;
            if (inventoryId && capturedPhoto) {
              await uploadCardPhoto(inventoryId, capturedPhoto);
            }
            try {
              await apiClient.post(ENDPOINTS.transactions.buy, {
                inventoryId,
                playerId: payload.playerId,
                playerName: payload.playerName ?? "",
                price: String(price),
                costBasis: String(price),
                channel: payload.channel,
                paymentMethod: payload.paymentMethod,
                dealRating: payload.dealRating,
                compPriceAtTime: payload.currentMarketValue ? String(payload.currentMarketValue) : null,
                gradeKey: payload.gradeKey,
                cardSnapshot: JSON.stringify(card),
                dailyLogId: payload.dailyLogId,
              });
              // Refresh dashboard and inventory queries
              if (userId) {
                queryClient.invalidateQueries({
                  queryKey: ["analytics", "daily", userId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["analytics", "today-activity", userId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["daily-logs", "active", userId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["inventory", userId],
                });
              }
            } catch {
              // Non-fatal
            }
            setConfirmed(true);
          },
        },
      );
    });
  };

  if (confirmed) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Transaction Receipt</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: "center", alignItems: "center" }}>
          {/* Receipt Card */}
          <View style={[styles.summaryCard, { width: "100%", paddingVertical: 32 }]}>
            <View style={styles.successCircle}>
              <Text style={{ fontSize: 48, color: "white" }}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Purchase Complete</Text>
            <Text style={styles.successSub}>Recorded successfully</Text>
            
            <View style={[styles.divider, { marginVertical: 24, width: "100%" }]} />
            
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center", width: "100%", paddingHorizontal: 4 }}>
              <View style={[styles.cardThumb, { width: 50, height: 68, marginBottom: 0 }]}>
                {(activeTab?.isExisting && activeTab?.cardData?.photos?.[0]) ? (
                  <Image
                    source={{ uri: activeTab.cardData.photos[0] }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
                    resizeMode="cover"
                  />
                ) : capturedPhoto ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${capturedPhoto}` }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
                    resizeMode="cover"
                  />
                ) : activeTab?.bestMatchImageUrl ? (
                  <Image
                    source={{ uri: activeTab.bestMatchImageUrl }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ color: "#555555", fontSize: 20, fontWeight: "900" }}>{initials}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardName, { fontSize: 16, textAlign: "left", marginBottom: 0 }]} numberOfLines={1}>
                  {card?.player_name ?? "Unknown Card"}
                </Text>
                <Text style={{ color: "#888888", fontSize: 12, marginTop: 2 }}>
                  {card?.year} · {card?.set_name}
                  {card?.variation ? ` · ${card.variation}` : ""}
                </Text>
                {card?.grading && (
                  <View style={[styles.gradePill, { marginTop: 4, alignSelf: "flex-start" }]}>
                    <Text style={styles.gradePillText}>
                      {card.grading.company} {card.grading.grade}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={[styles.divider, { marginVertical: 12, width: "100%" }]} />
            
            {/* Receipt Details rows */}
            <View style={{ gap: 10, width: "100%", paddingHorizontal: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#888888", fontSize: 13 }}>Purchase Price</Text>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>${price}</Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#888888", fontSize: 13 }}>Payment Method</Text>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600", textTransform: "capitalize" }}>
                  {paymentMethod || "—"}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#888888", fontSize: 13 }}>Assigned Log</Text>
                <Text style={{ color: "#FFD700", fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
                  {activeLog?.name || "Active Daily Log"}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Actions CTA buttons */}
          <View style={{ width: "100%", gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              style={{ backgroundColor: "#E8001C", height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" }}
              onPress={() => {
                if (activeTab?.id) removeTab(activeTab.id);
                router.replace("/buy/scan");
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Scan Another Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{ borderWidth: 1.5, borderColor: "#2A2A2A", height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" }}
              onPress={() => {
                if (activeTab?.id) removeTab(activeTab.id);
                router.replace("/(tabs)/inventory");
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>View Inventory</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{ height: 44, justifyContent: "center", alignItems: "center" }}
              onPress={() => {
                if (activeTab?.id) removeTab(activeTab.id);
                router.replace("/(tabs)/");
              }}
            >
              <Text style={{ color: "#888888", fontSize: 14, fontWeight: "600" }}>Return to Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 5 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardThumb}>
            {(activeTab?.isExisting && activeTab?.cardData?.photos?.[0]) ? (
              <Image
                source={{ uri: activeTab.cardData.photos[0] }}
                style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                resizeMode="cover"
              />
            ) : capturedPhoto ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${capturedPhoto}` }}
                style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                resizeMode="cover"
              />
            ) : activeTab?.bestMatchImageUrl ? (
              <Image
                source={{ uri: activeTab.bestMatchImageUrl }}
                style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                resizeMode="cover"
              />
            ) : (
              <Text
                style={{ color: "#555555", fontSize: 24, fontWeight: "900" }}
              >
                {initials}
              </Text>
            )}
          </View>
          <Text style={styles.cardName}>
            {card?.player_name ?? "Unknown Card"}
          </Text>
          <Text style={{ color: "#888888", fontSize: 12, marginBottom: 8 }}>
            {card?.year}
            {card?.set_name ? ` · ${card.set_name}` : ""}
            {card?.variation ? ` · ${card.variation}` : ""}
          </Text>
          {card?.grading && (
            <View style={styles.gradePill}>
              <Text style={styles.gradePillText}>
                {card.grading.company} {card.grading.grade}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.priceLabel}>PURCHASE PRICE</Text>
          <Text style={styles.priceValue}>{price ? `$${price}` : "—"}</Text>

          {(paymentMethod || channel) && (
            <View style={styles.methodRow}>
              {paymentMethod && (
                <>
                  <Text style={{ fontSize: 20 }}>
                    {PAYMENT_ICONS[paymentMethod] ?? "💳"}
                  </Text>
                  <Text style={styles.methodText}>
                    {paymentMethod.charAt(0).toUpperCase() +
                      paymentMethod.slice(1)}
                  </Text>
                </>
              )}
              {channel && channel !== "card_show" && (
                <Text
                  style={[
                    styles.methodText,
                    { color: "#555555", marginLeft: 8 },
                  ]}
                >
                  ·{" "}
                  {channel
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </Text>
              )}
              {channel === "card_show" && (
                <Text
                  style={[
                    styles.methodText,
                    { color: "#555555", marginLeft: 8 },
                  ]}
                >
                  · Card Show
                </Text>
              )}
            </View>
          )}

          {pctOfComp != null && (
            <View
              style={[
                styles.dealBadge,
                {
                  backgroundColor:
                    pctOfComp <= 75
                      ? "rgba(0,200,83,0.15)"
                      : pctOfComp <= 90
                        ? "rgba(255,179,0,0.15)"
                        : "rgba(232,0,28,0.15)",
                  borderColor:
                    pctOfComp <= 75
                      ? "rgba(0,200,83,0.3)"
                      : pctOfComp <= 90
                        ? "rgba(255,179,0,0.3)"
                        : "rgba(232,0,28,0.3)",
                },
              ]}
            >
              <Text
                style={[
                  styles.dealBadgeText,
                  {
                    color:
                      pctOfComp <= 75
                        ? "#00C853"
                        : pctOfComp <= 90
                          ? "#FFB300"
                          : "#E8001C",
                  },
                ]}
              >
                {pctOfComp <= 75
                  ? "✓ GOOD DEAL"
                  : pctOfComp <= 90
                    ? "↔ FAIR PRICE"
                    : "⚠ OVERPAYING"}{" "}
                — {pctOfComp}% of comp
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />

        {/* Confirm */}
        <TouchableOpacity
          style={[styles.confirmBtn, isPending && { opacity: 0.7 }]}
          disabled={isPending}
          onPress={() => {
            if (!card?.player_name || !price) {
              console.log("[CONFIRM] BLOCKED — missing card or price");
              return;
            }

            if (!activeLog) {
              Alert.alert(
                "No Active Daily Log",
                "You are about to record this purchase outside of an active daily log. Would you like to proceed or open a daily log first?",
                [
                  { text: "Open Daily Log", onPress: () => router.push("/(tabs)/") },
                  { text: "Proceed Anyway", onPress: () => proceedToSave() }
                ]
              );
            } else {
              proceedToSave();
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {isPending ? "SAVING..." : "CONFIRM PURCHASE"}
          </Text>
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
  progressFill: { height: 3, backgroundColor: "#0057FF" },
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
    overflow: "hidden",
  },
  cardName: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
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
    marginBottom: 6,
  },
  priceValue: {
    color: "white",
    fontSize: 48,
    fontWeight: "900",
    marginBottom: 16,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  methodText: { color: "#888888", fontSize: 15 },
  dealBadge: {
    backgroundColor: "rgba(0,200,83,0.15)",
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0,200,83,0.3)",
  },
  dealBadgeText: { color: "#00C853", fontSize: 13, fontWeight: "700" },
  confirmBtn: {
    backgroundColor: "#0057FF",
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
    backgroundColor: "#00C853",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: { color: "white", fontSize: 28, fontWeight: "700" },
  successSub: { color: "#888888", fontSize: 16, marginTop: 8 },
});
