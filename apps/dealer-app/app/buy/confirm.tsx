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
} from "react-native";
import { useRouter } from "expo-router";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useAddToInventory } from "../../src/hooks/useCardScan";
import { apiClient } from "../../src/lib/apiClient";
import { ENDPOINTS } from "../../src/config/api";
import * as FileSystem from "expo-file-system/legacy";

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵",
  venmo: "💜",
  zelle: "💙",
  paypal: "🅿️",
  cashapp: "💚",
  trade: "🔄",
  other: "💳",
};

const STEP_PCT = "100%";

async function uploadCardPhoto(
  inventoryId: string,
  base64: string,
): Promise<void> {
  let tempUri: string | null = null;
  try {
    const { data: presign } = await apiClient.post(
      ENDPOINTS.inventory.photos(inventoryId),
      { contentType: "image/jpeg", fileName: `scan-${Date.now()}.jpg` },
    );
    const { uploadUrl, publicUrl } = presign;

    // React Native's fetch() does not support data: URIs, so write to a temp file first
    tempUri = `${FileSystem.cacheDirectory}temp-card-scan-${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(tempUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const s3Res = await FileSystem.uploadAsync(uploadUrl, tempUri, {
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (s3Res.status < 200 || s3Res.status >= 300) {
      throw new Error(`S3 upload failed ${s3Res.status}: ${s3Res.body}`);
    }

    await apiClient.post(ENDPOINTS.inventory.photosConfirm(inventoryId), {
      url: publicUrl,
    });
  } catch (e) {
    console.warn("[PHOTO UPLOAD] failed:", e);
  } finally {
    if (tempUri) {
      try {
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      } catch (err) {
        console.warn("[PHOTO CLEANUP] failed:", err);
      }
    }
  }
}

export default function BuyConfirmScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tabs = useDealTabStore((s) => s.tabs);
  const removeTab = useDealTabStore((s) => s.removeTab);
  const activeTab = tabs[tabs.length - 1];
  const card = activeTab?.cardData;
  const cardId = activeTab?.cardId;
  const variantId = activeTab?.variantId;
  const price = activeTab?.price;
  const avgComp = activeTab?.avgComp;
  const paymentMethod = activeTab?.paymentMethod;
  const channel = activeTab?.channel ?? "card_show";
  const capturedPhoto = activeTab?.capturedPhoto;
  const pctOfComp =
    price && avgComp ? Math.round((price / avgComp) * 100) : null;
  const initials =
    card?.player_name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2) ?? "?";
  const { mutate: addToInventory, isPending } = useAddToInventory();
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
        router.replace("/(tabs)/inventory");
      }, 1800);
    }
  }, [confirmed]);

  if (confirmed) {
    return (
      <Animated.View style={[styles.successOverlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={{ color: "white", fontSize: 60, lineHeight: 70 }}>
            ✓
          </Text>
        </Animated.View>
        <Text style={styles.successTitle}>Card Added!</Text>
        <Text style={styles.successSub}>Inventory Updated</Text>
      </Animated.View>
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
            {activeTab?.bestMatchImageUrl ? (
              <Image
                source={{ uri: activeTab.bestMatchImageUrl }}
                style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                resizeMode="cover"
              />
            ) : capturedPhoto ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${capturedPhoto}` }}
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
            console.log(
              "[CONFIRM] card:",
              card?.player_name,
              "price:",
              price,
              "cardId:",
              cardId,
            );
            if (!card?.player_name || !price) {
              console.log("[CONFIRM] BLOCKED — missing card or price");
              return;
            }

            const dealRating =
              pctOfComp == null
                ? null
                : pctOfComp <= 75
                  ? "good_deal"
                  : pctOfComp <= 90
                    ? "fair_price"
                    : "overpaying";

            const gradeKey = card.grading
              ? `${card.grading.company}_${card.grading.grade}`
              : "RAW";

            addToInventory(
              {
                cardId: cardId || undefined,
                variantId: variantId || undefined,
                playerId: activeTab?.playerId ?? "",
                year: card.year ? Number(card.year) : undefined,
                setName: card.set_name ?? undefined,
                variation: card.variation ?? undefined,
                cardNumber: card.card_number ?? undefined,
                sport: card.sport ?? undefined,
                gradeCompany: card.grading?.company ?? undefined,
                gradeValue: card.grading?.grade ?? undefined,
                gradeKey,
                certNumber: card.grading?.cert_number ?? undefined,
                costBasis: price,
                currentMarketValue: avgComp ?? undefined,
                notes: paymentMethod ? `Paid via ${paymentMethod}` : undefined,
                ebaySalesCompleted: activeTab?.recentSales ? JSON.stringify(activeTab.recentSales) : undefined,
                ebayActiveListings: activeTab?.activeListings ? JSON.stringify(activeTab.activeListings) : undefined,
                myslabsSalesCompleted: activeTab?.myslabsRecentSales ? JSON.stringify(activeTab.myslabsRecentSales) : undefined,
                myslabsActiveListings: activeTab?.myslabsActiveListings ? JSON.stringify(activeTab.myslabsActiveListings) : undefined,
                photos: activeTab?.bestMatchImageUrl ? [activeTab.bestMatchImageUrl] : undefined,
              },
              {
                onSuccess: async (data: any) => {
                  const inventoryId = data?.item?.id ?? null;
                  if (inventoryId && !activeTab?.bestMatchImageUrl && capturedPhoto) {
                    uploadCardPhoto(inventoryId, capturedPhoto);
                  }
                  try {
                    await apiClient.post(ENDPOINTS.transactions.buy, {
                      inventoryId,
                      playerId: activeTab?.playerId,
                      playerName: card?.player_name || "Unknown Card",
                      price: String(price),
                      costBasis: String(price),
                      channel,
                      paymentMethod: paymentMethod ?? null,
                      dealRating,
                      compPriceAtTime: avgComp ? String(avgComp) : null,
                      gradeKey,
                      cardSnapshot: JSON.stringify(card),
                    });
                    // Refresh homepage stats immediately
                    if (userId) {
                      queryClient.invalidateQueries({
                        queryKey: ["analytics", "daily", userId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["analytics", "today-activity", userId],
                      });
                    }
                  } catch {
                    // Non-fatal — transaction record failed but inventory is saved
                  }
                  setConfirmed(true);
                },
              },
            );
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
