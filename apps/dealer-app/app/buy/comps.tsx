import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useEbaySold, useEbaySearch, useMyslabsSold } from "../../src/hooks/useCardScan";
import { format } from "date-fns";
import type { EbaySoldItem, EbaySearchItem } from "../../src/services/cardService";
import { isGraded } from "../../src/utils/gradeHelper";

const STEP_PCT = "40%";

function buildEbayQuery(card: any): string {
  if (!card) return "";
  if (card.search_string) return card.search_string;
  return [card.player_name, card.year, card.set_name, card.variation !== "Base" ? card.variation : "", card.card_number ? `#${card.card_number}` : "", card.grading ? `${card.grading.company} ${card.grading.grade}` : ""].filter(Boolean).join(" ");
}

function buildMyslabsQuery(card: any): string {
  if (!card) return "";
  if (card.search_string) return card.search_string;
  return buildEbayQuery(card);
}

function calcAvg(items: EbaySoldItem[]): number {
  if (!items.length) return 0;
  const prices = items
    .map((i) => parseFloat(i.soldPrice?.value ?? "0"))
    .filter((v) => v > 0);
  if (!prices.length) return 0;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

function DealRatingBadge({
  buyPrice,
  avgComp,
}: {
  buyPrice?: number;
  avgComp: number;
}) {
  if (!buyPrice || !avgComp) return null;
  const ratio = buyPrice / avgComp;
  let bg = "#FFB300",
    label = "FAIR PRICE",
    icon = "↔";
  if (ratio <= 0.85) {
    bg = "#00C853";
    label = "GREAT DEAL";
    icon = "🔥";
  } else if (ratio <= 0.95) {
    bg = "#00C853";
    label = "GOOD DEAL";
    icon = "✓";
  } else if (ratio > 1.05) {
    bg = "#E8001C";
    label = "OVERPAYING";
    icon = "⚠";
  }
  return (
    <View style={{ alignItems: "center", marginVertical: 16 }}>
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 100,
          paddingHorizontal: 28,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
          {icon}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 15,
            fontWeight: "900",
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ color: "#888888", fontSize: 12, marginTop: 6 }}>
        Buying at {Math.round(ratio * 100)}% of 30d avg comp
      </Text>
    </View>
  );
}

export default function BuyCompsScreen() {
  const router = useRouter();
  const tabs = useDealTabStore((s) => s.tabs);
  const updateTab = useDealTabStore((s) => s.updateTab);
  const activeTab = tabs[tabs.length - 1];
  const card = activeTab?.cardData;

  const ebayQuery = buildEbayQuery(card);

  const myslabsQuery = buildMyslabsQuery(card);

  const [salesVisibleCount, setSalesVisibleCount] = useState(5);
  const [activeVisibleCount, setActiveVisibleCount] = useState(5);

  const resolvedGradeKey = card?.grading ? `${card.grading.company} ${card.grading.grade}` : "RAW";

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useEbaySold(ebayQuery, {
    limit: 50,
    variantId: activeTab?.variantId,
    gradeKey: resolvedGradeKey,
  });

  const { data: myslabsData, isLoading: myslabsLoading, isError: myslabsError, refetch: refetchMyslabs, fetchNextPage: fetchMyslabsNextPage, hasNextPage: hasMyslabsNextPage, isFetchingNextPage: isFetchingMyslabsNextPage } = useMyslabsSold(myslabsQuery, {
    limit: 50,
    variantId: activeTab?.variantId,
    gradeKey: resolvedGradeKey,
  });

  const ebayPages = data?.pages ?? [];
  const myslabsPages = myslabsData?.pages ?? [];

  const ebayActive = ebayPages.flatMap(p => p.activeListings ?? []).map(i => ({ ...i, platform: "eBay", displayPrice: i.price?.value }));
  const myslabsActive = myslabsPages.flatMap(p => p.activeListings ?? []).map(i => ({ ...i, platform: "MySlabs", displayPrice: i.soldPrice?.value ?? (i as any).price?.value }));

  const allActiveItems = [...ebayActive, ...myslabsActive].sort((a, b) => parseFloat(a.displayPrice ?? "0") - parseFloat(b.displayPrice ?? "0"));
  const activeItems = allActiveItems.slice(0, activeVisibleCount);

  const ebaySold30 = ebayPages.flatMap(p => p.sold30d?.items ?? []).map(i => ({ ...i, platform: "eBay" }));
  const myslabsSold30 = myslabsPages.flatMap(p => p.sold30d?.items ?? []).map(i => ({ ...i, platform: "MySlabs" }));
  const sold30 = [...ebaySold30, ...myslabsSold30].sort((a, b) => new Date((b as any).endDate ?? 0).getTime() - new Date((a as any).endDate ?? 0).getTime()) as any[];

  const ebaySold7 = ebayPages.flatMap(p => p.sold7d?.items ?? []).map(i => ({ ...i, platform: "eBay" }));
  const myslabsSold7 = myslabsPages.flatMap(p => p.sold7d?.items ?? []).map(i => ({ ...i, platform: "MySlabs" }));
  const sold7 = [...ebaySold7, ...myslabsSold7].sort((a, b) => new Date((b as any).endDate ?? 0).getTime() - new Date((a as any).endDate ?? 0).getTime()) as any[];

  const allRecentSales = sold30;
  const recentSales = allRecentSales.slice(0, salesVisibleCount);
  const recentSalesGraded = recentSales.filter(item => isGraded(item.title, item.condition));
  const recentSalesRaw = recentSales.filter(item => !isGraded(item.title, item.condition));
  const activeGraded = activeItems.filter(item => isGraded(item.title, item.condition));
  const activeRaw = activeItems.filter(item => !isGraded(item.title, item.condition));

  const avg30 = calcAvg(sold30 as any);
  const avg7 = calcAvg(sold7 as any);
  const trend = avg30 > 0 ? ((avg7 - avg30) / avg30) * 100 : 0;
  const sparklineData = sold30
    .slice(0, 8)
    .map((i) => parseFloat(i.soldPrice?.value ?? "0"))
    .reverse();
  const maxSpark = Math.max(...sparklineData, 1);

  const isLoadingAll = isLoading || myslabsLoading;
  const isErrorAll = isError || myslabsError;

  const initials =
    card?.player_name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2) ?? "?";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 2 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Card identity */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            gap: 14,
          }}
        >
          <View style={styles.cardThumb}>
            <Text style={{ color: "#555555", fontSize: 18, fontWeight: "700" }}>
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>
              {card?.player_name ?? "Unknown Card"}
            </Text>
            <Text style={{ color: "#888888", fontSize: 12, marginTop: 2 }}>
              {card?.year} · {card?.set_name}
              {card?.variation ? ` · ${card.variation}` : ""}
            </Text>
            {card?.grading && (
              <View style={styles.gradePill}>
                <Text style={styles.gradePillText}>
                  {card.grading.company} {card.grading.grade}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Loading / Error */}
        {isLoading && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator color="#0057FF" size="large" />
            <Text style={{ color: "#888888", marginTop: 12, fontSize: 13 }}>
              Fetching eBay comps...
            </Text>
          </View>
        )}

        {isError && (
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: "#1A1A1A",
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: "#E8001C", fontWeight: "700", marginBottom: 8 }}
            >
              Failed to load comps
            </Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={{ color: "#0057FF", fontWeight: "700" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && (
          <>
            {/* Avg comp hero */}
            <View style={styles.avgBox}>
              <Text style={styles.avgLabel}>
                AVG SOLD — LAST 30 DAYS (eBay & MySlabs)
              </Text>
              <Text style={styles.avgValue}>
                {avg30 > 0 ? `$${avg30.toFixed(2)}` : "—"}
              </Text>
              {avg7 > 0 && avg30 > 0 && (
                <Text
                  style={{
                    color: trend >= 0 ? "#00C853" : "#E8001C",
                    fontSize: 13,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}% (7d vs
                  30d avg)
                </Text>
              )}
              <Text style={{ color: "#555555", fontSize: 11, marginTop: 4 }}>
                {sold30.length} sales · 7d avg:{" "}
                {avg7 > 0 ? `$${avg7.toFixed(0)}` : "—"}
              </Text>
            </View>

            {/* Sparkline */}
            {sparklineData.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                <Text style={styles.sectionLabel}>30-DAY PRICE TREND</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 4,
                    height: 56,
                    marginTop: 10,
                  }}
                >
                  {sparklineData.map((v, i) => (
                    <View key={i} style={{ flex: 1, alignItems: "center" }}>
                      <View
                        style={{
                          width: "100%",
                          height: Math.max((v / maxSpark) * 48, 4),
                          backgroundColor:
                            i === sparklineData.length - 1
                              ? "#00C853"
                              : "#0057FF",
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Deal rating */}
            <DealRatingBadge buyPrice={activeTab?.price} avgComp={avg30} />

            {/* Recent eBay sales */}

            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                <Text style={styles.sectionLabel}>RECENT SALES - GRADED</Text>
                {recentSalesGraded.length > 0 ? (
                <View style={styles.sectionCard}>
                  {recentSalesGraded.map((sale, i) => (
                    <TouchableOpacity
                      key={sale.itemId}
                      activeOpacity={sale.itemWebUrl ? 0.7 : 1}
                      onPress={() => {
                        if (sale.itemWebUrl) {
                          Linking.openURL(sale.itemWebUrl).catch(err => console.error("Could not open URL", err));
                        }
                      }}
                      style={[
                        styles.saleRow,
                        i < recentSalesGraded.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 }}>
                        {sale.image?.imageUrl && (
                          <Image
                            source={{ uri: sale.image.imageUrl }}
                            style={{
                              width: 36,
                              height: 50,
                              borderRadius: 4,
                              marginRight: 10,
                              backgroundColor: "#222222",
                            }}
                            resizeMode="cover"
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }} numberOfLines={2}>
                            {sale.title}
                          </Text>
                          {sale.condition && (
                            <Text
                              style={{
                                color: "#555555",
                                fontSize: 10,
                                marginTop: 2,
                              }}
                            >
                              {sale.condition}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.salePrice}>
                          ${parseFloat(sale.soldPrice?.value ?? "0").toFixed(2)}
                        </Text>
                        <Text style={styles.saleDate}>
                          {sale.endDate
                            ? format(new Date(sale.endDate), "MMM d, yyyy")
                            : "—"}
                        </Text>
                        {sale.platform && (
                          <View
                            style={[
                              styles.platformBadge,
                              { backgroundColor: sale.platform === "eBay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)", marginRight: 0, marginTop: 6, paddingHorizontal: 6, paddingVertical: 2 },
                            ]}
                          >
                            <Text
                              style={[styles.platformBadgeText, { color: sale.platform === "eBay" ? "#0057FF" : "#E01F2B", fontSize: 9 }]}
                            >
                              {sale.platform}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={{ color: "#555", fontSize: 13, marginBottom: 16, fontStyle: "italic" }}>No graded sales found.</Text>
              )}
              </View>

            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                <Text style={styles.sectionLabel}>RECENT SALES - RAW</Text>
                {recentSalesRaw.length > 0 ? (
                <View style={styles.sectionCard}>
                  {recentSalesRaw.map((sale, i) => (
                    <TouchableOpacity
                      key={sale.itemId}
                      activeOpacity={sale.itemWebUrl ? 0.7 : 1}
                      onPress={() => {
                        if (sale.itemWebUrl) {
                          Linking.openURL(sale.itemWebUrl).catch(err => console.error("Could not open URL", err));
                        }
                      }}
                      style={[
                        styles.saleRow,
                        i < recentSalesRaw.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 }}>
                        {sale.image?.imageUrl && (
                          <Image
                            source={{ uri: sale.image.imageUrl }}
                            style={{
                              width: 36,
                              height: 50,
                              borderRadius: 4,
                              marginRight: 10,
                              backgroundColor: "#222222",
                            }}
                            resizeMode="cover"
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }} numberOfLines={2}>
                            {sale.title}
                          </Text>
                          {sale.condition && (
                            <Text
                              style={{
                                color: "#555555",
                                fontSize: 10,
                                marginTop: 2,
                              }}
                            >
                              {sale.condition}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.salePrice}>
                          ${parseFloat(sale.soldPrice?.value ?? "0").toFixed(2)}
                        </Text>
                        <Text style={styles.saleDate}>
                          {sale.endDate
                            ? format(new Date(sale.endDate), "MMM d, yyyy")
                            : "—"}
                        </Text>
                        {sale.platform && (
                          <View
                            style={[
                              styles.platformBadge,
                              { backgroundColor: sale.platform === "eBay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)", marginRight: 0, marginTop: 6, paddingHorizontal: 6, paddingVertical: 2 },
                            ]}
                          >
                            <Text
                              style={[styles.platformBadgeText, { color: sale.platform === "eBay" ? "#0057FF" : "#E01F2B", fontSize: 9 }]}
                            >
                              {sale.platform}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={{ color: "#555", fontSize: 13, marginBottom: 16, fontStyle: "italic" }}>No raw sales found.</Text>
              )}
              </View>

            {(allRecentSales.length > salesVisibleCount || hasNextPage || hasMyslabsNextPage) && (
              <View style={{ paddingHorizontal: 20 }}>
                <TouchableOpacity
                  style={{ padding: 16, alignItems: "center", backgroundColor: "#1A1A1A", borderRadius: 12, marginTop: 10 }}
                  onPress={() => {
                    if (salesVisibleCount < allRecentSales.length) {
                      setSalesVisibleCount(c => c + 10);
                    } else {
                      if (hasNextPage) fetchNextPage();
                      if (hasMyslabsNextPage) fetchMyslabsNextPage();
                      setSalesVisibleCount(c => c + 10);
                    }
                  }}
                  disabled={isFetchingNextPage || isFetchingMyslabsNextPage}
                >
                  {(isFetchingNextPage || isFetchingMyslabsNextPage) ? (
                    <ActivityIndicator color="#0057FF" />
                  ) : (
                    <Text style={{ color: "#0057FF", fontWeight: "600", fontSize: 14 }}>Show More Sales</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* No data fallback */}
            {recentSales.length === 0 && (
              <View
                style={{
                  marginHorizontal: 20,
                  backgroundColor: "#111111",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#555555", fontSize: 13 }}>
                  No recent sales found
                </Text>
                <Text style={{ color: "#333333", fontSize: 11, marginTop: 4 }}>
                  Try adjusting the card details
                </Text>
              </View>
            )}

            {/* Current eBay Active Listings */}

            <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
                <Text style={styles.sectionLabel}>CURRENT ACTIVE LISTINGS - GRADED</Text>
                {activeGraded.length > 0 ? (
                <View style={styles.sectionCard}>
                  {activeGraded.map((item, i) => (
                    <TouchableOpacity
                      key={item.itemId}
                      activeOpacity={item.itemWebUrl ? 0.7 : 1}
                      onPress={() => {
                        if (item.itemWebUrl) {
                          Linking.openURL(item.itemWebUrl).catch(err => console.error("Could not open URL", err));
                        }
                      }}
                      style={[
                        styles.saleRow,
                        i < activeGraded.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 }}>
                        {item.image?.imageUrl && (
                          <Image
                            source={{ uri: item.image.imageUrl }}
                            style={{
                              width: 36,
                              height: 50,
                              borderRadius: 4,
                              marginRight: 10,
                              backgroundColor: "#222222",
                            }}
                            resizeMode="cover"
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }} numberOfLines={2}>
                            {item.title}
                          </Text>
                          {item.condition && (
                            <Text
                              style={{
                                color: "#555555",
                                fontSize: 10,
                                marginTop: 2,
                              }}
                            >
                              {item.condition}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.salePrice}>
                          ${parseFloat(item.displayPrice ?? "0").toFixed(2)}
                        </Text>
                        {item.platform && (
                          <View
                            style={[
                              styles.platformBadge,
                              { backgroundColor: item.platform === "eBay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)", marginRight: 0, marginTop: 6, paddingHorizontal: 6, paddingVertical: 2 },
                            ]}
                          >
                            <Text
                              style={[styles.platformBadgeText, { color: item.platform === "eBay" ? "#0057FF" : "#E01F2B", fontSize: 9 }]}
                            >
                              {item.platform}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={{ color: "#555", fontSize: 13, marginBottom: 16, fontStyle: "italic" }}>No graded active listings found.</Text>
              )}
              </View>

            <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
                <Text style={styles.sectionLabel}>CURRENT ACTIVE LISTINGS - RAW</Text>
                {activeRaw.length > 0 ? (
                <View style={styles.sectionCard}>
                  {activeRaw.map((item, i) => (
                    <TouchableOpacity
                      key={item.itemId}
                      activeOpacity={item.itemWebUrl ? 0.7 : 1}
                      onPress={() => {
                        if (item.itemWebUrl) {
                          Linking.openURL(item.itemWebUrl).catch(err => console.error("Could not open URL", err));
                        }
                      }}
                      style={[
                        styles.saleRow,
                        i < activeRaw.length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 }}>
                        {item.image?.imageUrl && (
                          <Image
                            source={{ uri: item.image.imageUrl }}
                            style={{
                              width: 36,
                              height: 50,
                              borderRadius: 4,
                              marginRight: 10,
                              backgroundColor: "#222222",
                            }}
                            resizeMode="cover"
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }} numberOfLines={2}>
                            {item.title}
                          </Text>
                          {item.condition && (
                            <Text
                              style={{
                                color: "#555555",
                                fontSize: 10,
                                marginTop: 2,
                              }}
                            >
                              {item.condition}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.salePrice}>
                          ${parseFloat(item.displayPrice ?? "0").toFixed(2)}
                        </Text>
                        {item.platform && (
                          <View
                            style={[
                              styles.platformBadge,
                              { backgroundColor: item.platform === "eBay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)", marginRight: 0, marginTop: 6, paddingHorizontal: 6, paddingVertical: 2 },
                            ]}
                          >
                            <Text
                              style={[styles.platformBadgeText, { color: item.platform === "eBay" ? "#0057FF" : "#E01F2B", fontSize: 9 }]}
                            >
                              {item.platform}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={{ color: "#555", fontSize: 13, marginBottom: 16, fontStyle: "italic" }}>No raw active listings found.</Text>
              )}
              </View>

            {(allActiveItems.length > activeVisibleCount || hasNextPage || hasMyslabsNextPage) && (
              <View style={{ paddingHorizontal: 20 }}>
                <TouchableOpacity
                  style={{ padding: 16, alignItems: "center", backgroundColor: "#1A1A1A", borderRadius: 12, marginTop: 10 }}
                  onPress={() => {
                    if (activeVisibleCount < allActiveItems.length) {
                      setActiveVisibleCount(c => c + 10);
                    } else {
                      if (hasNextPage) fetchNextPage();
                      if (hasMyslabsNextPage) fetchMyslabsNextPage();
                      setActiveVisibleCount(c => c + 10);
                    }
                  }}
                  disabled={isFetchingNextPage || isFetchingMyslabsNextPage}
                >
                  {(isFetchingNextPage || isFetchingMyslabsNextPage) ? (
                    <ActivityIndicator color="#0057FF" />
                  ) : (
                    <Text style={{ color: "#0057FF", fontWeight: "600", fontSize: 14 }}>Show More Active</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (activeTab?.id) {
              const bestMatchItem = activeItems.find((item) => item.image?.imageUrl);
              const bestMatchImageUrl = bestMatchItem?.image?.imageUrl;
              updateTab(activeTab.id, {
                ...(avg30 > 0 ? { avgComp: avg30, recentSales: ebaySold30, myslabsRecentSales: myslabsSold30 } : {}),
                bestMatchImageUrl,
                activeListings: ebayActive.length > 0 ? ebayActive : undefined,
                myslabsActiveListings: myslabsActive.length > 0 ? myslabsActive : undefined,
              });
            }
            router.push("/buy/price");
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>ENTER PRICE →</Text>
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
  cardThumb: {
    width: 60,
    height: 80,
    backgroundColor: "#222222",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { color: "white", fontWeight: "700", fontSize: 15 },
  gradePill: {
    backgroundColor: "#FFD700",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  gradePillText: { color: "#000", fontSize: 11, fontWeight: "700" },
  avgBox: {
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 16,
  },
  avgLabel: {
    color: "#555555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  avgValue: { color: "white", fontSize: 36, fontWeight: "900" },
  sectionLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  saleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    justifyContent: "space-between",
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  salePrice: { color: "white", fontWeight: "700", fontSize: 15 },
  platformChip: {
    backgroundColor: "rgba(0,87,255,0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginHorizontal: 10,
  },
  platformChipText: { fontSize: 11, fontWeight: "700", color: "#0057FF" },
  saleDate: { color: "#555555", fontSize: 12 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  primaryBtn: {
    backgroundColor: "#0057FF",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  platformBadge: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  platformBadgeText: {
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
