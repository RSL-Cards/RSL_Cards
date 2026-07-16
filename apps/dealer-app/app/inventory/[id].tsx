import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useInventoryItem } from "../../src/hooks/useCardScan";
import { isGraded } from "../../src/utils/gradeHelper";
import { format, isValid } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

const safeFormatDate = (dateVal: string | number | undefined | null) => {
  if (!dateVal) return "—";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy");
};

const getListingUrl = (sale: any) => {
  if (sale.itemWebUrl) return sale.itemWebUrl;
  if (sale.itemId && sale.platform) {
    if (sale.platform.toLowerCase() === "ebay") return `https://www.ebay.com/itm/${sale.itemId}`;
    if (sale.platform.toLowerCase() === "myslabs") return `https://myslabs.com/slab/view/${sale.itemId}`;
  }
  return null;
};

function GradeChip({ gradeKey }: { gradeKey?: string }) {
  if (!gradeKey) return null;
  const configs: Record<string, { bg: string; color: string; label: string }> =
    {
      PSA_10: { bg: "#FFD700", color: "#000000", label: "PSA 10" },
      PSA_9: { bg: "#1A1A1A", color: "#FFD700", label: "PSA 9" },
      BGS_9: { bg: "#0057FF", color: "#FFFFFF", label: "BGS 9" },
      BGS_9_5: { bg: "#0057FF", color: "#FFFFFF", label: "BGS 9.5" },
      SGC_10: { bg: "#1A1A1A", color: "#00C853", label: "SGC 10" },
      RAW: { bg: "#2A2A2A", color: "#888888", label: "RAW" },
    };
  const cfg = configs[gradeKey] ?? {
    bg: "#2A2A2A",
    color: "#888888",
    label: gradeKey,
  };
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: cfg.color, fontSize: 13, fontWeight: "700" }}>
        {cfg.label}
      </Text>
    </View>
  );
}

export default function CardDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: card, isLoading, isError } = useInventoryItem(id ?? "");

  const [activeToggle, setActiveToggle] = useState<"Graded" | "Raw">("Graded");
  const [compsSourceTab, setCompsSourceTab] = useState<"ebay_sold" | "ebay_active" | "myslabs_sold" | "myslabs_active">("ebay_sold");
  const [salesVisibleCount, setSalesVisibleCount] = useState(20);
  const [activeVisibleCount, setActiveVisibleCount] = useState(20);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#E8001C" size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !card) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#555555", fontSize: 15 }}>Card not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: "#E8001C", fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const costBasis = parseFloat(card.cost_basis ?? "0");
  const marketValue = parseFloat(card.current_market_value ?? "0");
  const unrealizedGain = marketValue > 0 ? marketValue - costBasis : 0;
  const unrealizedGainPct =
    costBasis > 0 && marketValue > 0
      ? Math.round(((marketValue - costBasis) / costBasis) * 100)
      : 0;
  const _addedAtStr = card.added_at ? String(card.added_at).replace(' ', 'T') : null;
  const _addedAtRaw = _addedAtStr ? new Date(_addedAtStr) : null;
  const addedAt =
    _addedAtRaw && isValid(_addedAtRaw) ? _addedAtRaw : new Date();
  const daysHeld = typeof card.days_held === 'number' ? card.days_held : Math.floor((Date.now() - addedAt.getTime()) / 86400000);
  const gainColor = unrealizedGain >= 0 ? "#00C853" : "#E8001C";

  const initials = (card.player_name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rawEbaySales = card.ebay_sales_completed ? JSON.parse(card.ebay_sales_completed) : [];
  const rawMyslabsSales = card.myslabs_sales_completed ? JSON.parse(card.myslabs_sales_completed) : [];
  const rawEbayActive = card.ebay_active_listings ? JSON.parse(card.ebay_active_listings) : [];
  const rawMyslabsActive = card.myslabs_active_listings ? JSON.parse(card.myslabs_active_listings) : [];

  const allSales = [...rawEbaySales, ...rawMyslabsSales];
  const allActive = [...rawEbayActive, ...rawMyslabsActive];

  const localEbaySales = allSales.filter((i: any) => !i.platform || i.platform.toLowerCase() === 'ebay').map((i: any) => ({ ...i, platform: 'eBay' }));
  const localMyslabsSales = allSales.filter((i: any) => i.platform && i.platform.toLowerCase() === 'myslabs').map((i: any) => ({ ...i, platform: 'MySlabs' }));

  const localEbayActive = allActive.filter((i: any) => !i.platform || i.platform.toLowerCase() === 'ebay').map((i: any) => ({ ...i, platform: 'eBay' }));
  const localMyslabsActive = allActive.filter((i: any) => i.platform && i.platform.toLowerCase() === 'myslabs').map((i: any) => ({ ...i, platform: 'MySlabs' }));

  const sortedEbaySales = localEbaySales.filter((s: any) => parseFloat(s.soldPrice?.value ?? "0") > 0).sort((a: any, b: any) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());
  const sortedMyslabsSales = localMyslabsSales.filter((s: any) => parseFloat(s.soldPrice?.value ?? "0") > 0).sort((a: any, b: any) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());

  let recentEbayShow = sortedEbaySales.slice(0, 4);
  let recentMyslabsShow = sortedMyslabsSales.slice(0, 4);
  if (recentEbayShow.length < 4) recentMyslabsShow = sortedMyslabsSales.slice(0, 8 - recentEbayShow.length);
  else if (recentMyslabsShow.length < 4) recentEbayShow = sortedEbaySales.slice(0, 8 - recentMyslabsShow.length);
  
  const recentSales = [...recentEbayShow, ...recentMyslabsShow]
    .sort((a, b) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());
  const recentSalesGraded = recentSales.filter((item: any) => isGraded(item.title, item.condition));
  const recentSalesRaw = recentSales.filter((item: any) => !isGraded(item.title, item.condition));

  
  const sortedEbayActive = localEbayActive.sort((a: any, b: any) => parseFloat(a.price?.value ?? "0") - parseFloat(b.price?.value ?? "0"));
  const sortedMyslabsActive = localMyslabsActive.sort((a: any, b: any) => parseFloat(a.price?.value ?? a.soldPrice?.value ?? "0") - parseFloat(b.price?.value ?? b.soldPrice?.value ?? "0"));

  let activeEbayShow = sortedEbayActive.slice(0, 3);
  let activeMyslabsShow = sortedMyslabsActive.slice(0, 3);
  if (activeEbayShow.length < 3) activeMyslabsShow = sortedMyslabsActive.slice(0, 6 - activeEbayShow.length);
  else if (activeMyslabsShow.length < 3) activeEbayShow = sortedEbayActive.slice(0, 6 - activeMyslabsShow.length);

  const localActiveListings = [...activeEbayShow, ...activeMyslabsShow]
    .sort((a, b) => parseFloat(a.price?.value ?? a.soldPrice?.value ?? "0") - parseFloat(b.price?.value ?? b.soldPrice?.value ?? "0"))
    .slice(0, 5);
  const activeGraded = localActiveListings.filter((item: any) => isGraded(item.title, item.condition));
  const activeRaw = localActiveListings.filter((item: any) => !isGraded(item.title, item.condition));

  const avgSold = recentSales.length > 0
    ? recentSales.reduce(
        (sum: number, s: any) => sum + parseFloat(s.soldPrice?.value ?? "0"),
        0,
      ) / recentSales.length
    : 0;

  const stats = [
    {
      label: "Cost Basis",
      value: `$${costBasis.toFixed(2)}`,
      color: "#888888",
    },
    {
      label: "Your Target Price",
      value: marketValue > 0 ? `$${marketValue.toFixed(2)}` : "—",
      color: "white",
    },
    {
      label: "Days Held",
      value: `${daysHeld}d`,
      color: daysHeld >= 60 ? "#FFB300" : "white",
    },
    {
      label: "Unrealized P&L",
      value:
        marketValue > 0
          ? `${unrealizedGain >= 0 ? "+" : ""}$${unrealizedGain.toFixed(2)} (${unrealizedGainPct >= 0 ? "+" : ""}${unrealizedGainPct}%)`
          : "—",
      color: marketValue > 0 ? gainColor : "#555555",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Card Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card image */}
        <View style={styles.imageArea}>
          {card.photos?.[0] ? (
            <Image
              source={{ uri: card.photos[0] }}
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.imageInitials}>{initials}</Text>
          )}
          {card.cert_number && (
            <View style={styles.certBadge}>
              <Text style={styles.certText}>Cert #{card.cert_number}</Text>
            </View>
          )}
          {card.listing_status && card.listing_status !== "unlisted" && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    card.listing_status === "listed"
                      ? "rgba(0,87,255,0.8)"
                      : "rgba(0,200,83,0.8)",
                },
              ]}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {card.listing_status}
              </Text>
            </View>
          )}
        </View>

        {/* Player info */}
        <View
          style={{
            paddingHorizontal: 24,
            marginTop: 20,
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text style={styles.playerName}>{card.player_name}</Text>
          <Text style={styles.cardSubtitle}>
            {[
              card.year,
              card.set_name,
              card.variation && card.variation !== "Base"
                ? card.variation
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {card.card_number && (
            <Text style={{ color: "#555555", fontSize: 12 }}>
              #{card.card_number}
            </Text>
          )}
          <GradeChip gradeKey={card.grade_key} />
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Card details row */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={styles.sectionLabel}>CARD DETAILS</Text>
          <View style={styles.sectionCard}>
            {[
              { label: "Sport", value: card.sport },
              { label: "Manufacturer", value: card.manufacturer ?? "—" },
              { label: "Payment", value: card.notes ?? "—" },
              { label: "Added", value: format(addedAt, "MMM d, yyyy") },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[
                  styles.detailRow,
                  i < arr.length - 1 && styles.saleRowBorder,
                ]}
              >
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value ?? "—"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* eBay avg + recent sales */}
        {avgSold > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            {/* Graded vs Raw Toggle */}
            <View style={{ flexDirection: "row", backgroundColor: "#1A1A1A", borderRadius: 8, padding: 4, marginBottom: 16 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 8, alignItems: "center", backgroundColor: activeToggle === "Graded" ? "#333" : "transparent", borderRadius: 6 }}
                onPress={() => setActiveToggle("Graded")}
              >
                <Text style={{ color: activeToggle === "Graded" ? "#FFF" : "#888", fontSize: 13, fontWeight: "600" }}>Graded</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 8, alignItems: "center", backgroundColor: activeToggle === "Raw" ? "#333" : "transparent", borderRadius: 6 }}
                onPress={() => setActiveToggle("Raw")}
              >
                <Text style={{ color: activeToggle === "Raw" ? "#FFF" : "#888", fontSize: 13, fontWeight: "600" }}>Raw</Text>
              </TouchableOpacity>
            </View>

            {/* Comps Source Tabs */}
            <View style={{ paddingBottom: 10, marginHorizontal: -20 }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
              >
                {[
                  { id: "ebay_sold", label: "eBay Sold" },
                  { id: "ebay_active", label: "eBay Active" },
                  { id: "myslabs_sold", label: "MySlabs Sold" },
                  { id: "myslabs_active", label: "MySlabs Active" },
                ].map((tab) => {
                  const isActive = compsSourceTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      activeOpacity={0.7}
                      onPress={() => setCompsSourceTab(tab.id as any)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        backgroundColor: isActive ? "#0057FF" : "#1A1A1A",
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: isActive ? "#0057FF" : "#333",
                      }}
                    >
                      <Text style={{
                        color: isActive ? "#FFF" : "#AAA",
                        fontSize: 13,
                        fontWeight: isActive ? "600" : "400"
                      }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tabular Data View */}
            <View style={{ marginTop: 16 }}>
              {(() => {
                let currentData: any[] = [];
                if (compsSourceTab === "ebay_sold") {
                  currentData = activeToggle === "Graded" ? localEbaySales.filter((item: any) => isGraded(item.title, item.condition)) : localEbaySales.filter((item: any) => !isGraded(item.title, item.condition));
                } else if (compsSourceTab === "ebay_active") {
                  currentData = activeToggle === "Graded" ? localEbayActive.filter((item: any) => isGraded(item.title, item.condition)) : localEbayActive.filter((item: any) => !isGraded(item.title, item.condition));
                } else if (compsSourceTab === "myslabs_sold") {
                  currentData = activeToggle === "Graded" ? localMyslabsSales.filter((item: any) => isGraded(item.title, item.condition)) : localMyslabsSales.filter((item: any) => !isGraded(item.title, item.condition));
                } else if (compsSourceTab === "myslabs_active") {
                  currentData = activeToggle === "Graded" ? localMyslabsActive.filter((item: any) => isGraded(item.title, item.condition)) : localMyslabsActive.filter((item: any) => !isGraded(item.title, item.condition));
                }

                if (currentData.length === 0) {
                  return (
                    <Text style={{ color: "#555", fontSize: 13, marginTop: 16, fontStyle: "italic", textAlign: "center" }}>
                      No {activeToggle.toLowerCase()} data found for this tab.
                    </Text>
                  );
                }

                return (
                  <View style={styles.sectionCard}>
                    {/* Table Header */}
                    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 8, marginBottom: 8, paddingHorizontal: 4 }}>
                      <Text style={{ flex: 0.15, color: "#888", fontSize: 10, fontWeight: "600" }}>IMG</Text>
                      <Text style={{ flex: 0.55, color: "#888", fontSize: 10, fontWeight: "600", paddingLeft: 8 }}>TITLE & COND.</Text>
                      <Text style={{ flex: 0.3, color: "#888", fontSize: 10, fontWeight: "600", textAlign: "right" }}>PRICE & DATE</Text>
                    </View>
                    
                    {currentData.slice(0, compsSourceTab.includes("sold") ? salesVisibleCount : activeVisibleCount).map((sale, i) => {
                      const displayPrice = sale.soldPrice?.value ?? sale.price?.value ?? sale.displayPrice ?? "0";
                      const linkUrl = getListingUrl(sale);
                      return (
                        <TouchableOpacity
                          key={sale.itemId || i}
                          activeOpacity={linkUrl ? 0.7 : 1}
                          onPress={() => {
                            if (linkUrl) {
                              WebBrowser.openBrowserAsync(linkUrl);
                            }
                          }}
                          style={[
                            styles.saleRow,
                            i < currentData.length - 1 && styles.saleRowBorder,
                          ]}
                        >
                          <View style={{ flex: 0.15, alignItems: "flex-start" }}>
                            {sale.image?.imageUrl ? (
                              <Image
                                source={{ uri: sale.image.imageUrl }}
                                style={{
                                  width: 36,
                                  height: 50,
                                  borderRadius: 4,
                                  backgroundColor: "#222222",
                                }}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={{ width: 36, height: 50, backgroundColor: "#222", borderRadius: 4, justifyContent: "center", alignItems: "center" }}>
                                <Ionicons name="image-outline" size={16} color="#555" />
                              </View>
                            )}
                          </View>
                          <View style={{ flex: 0.55, paddingHorizontal: 8 }}>
                            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }} numberOfLines={2}>
                              {sale.title}
                            </Text>
                            {sale.condition && (
                              <Text style={{ color: "#555555", fontSize: 10, marginTop: 4 }}>
                                {sale.condition}
                              </Text>
                            )}
                          </View>
                          <View style={{ flex: 0.3, alignItems: "flex-end" }}>
                            <Text style={[styles.salePrice, { fontSize: 13 }]}>
                              ${parseFloat(displayPrice).toFixed(2)}
                            </Text>
                            <Text style={[styles.saleDate, { fontSize: 10, marginTop: 4 }]}>
                              {compsSourceTab.includes("sold") ? safeFormatDate(sale.endDate) : "Active"}
                            </Text>
                            {sale.platform && (
                              <View
                                style={[
                                  styles.platformBadge,
                                  { backgroundColor: sale.platform?.toLowerCase() === "ebay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)", marginRight: 0, marginTop: 6, paddingHorizontal: 6, paddingVertical: 2 },
                                ]}
                              >
                                <Text
                                  style={[styles.platformBadgeText, { color: sale.platform?.toLowerCase() === "ebay" ? "#0057FF" : "#E01F2B", fontSize: 9 }]}
                                >
                                  {sale.platform}
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })()}
            </View>
          </View>
        )}

        {recentSales.length === 0 && localActiveListings.length === 0 && !!card.player_name && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={styles.sectionLabel}>COMPS DATA</Text>
            <View
              style={[
                styles.sectionCard,
                { padding: 20, alignItems: "center" },
              ]}
            >
              <Text style={{ color: "#555555", fontSize: 13 }}>
                No comps data stored for this card
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[
            styles.listBtn,
            card?.listing_status === "listed" && { borderColor: "#555555", opacity: 0.6 }
          ]}
          onPress={() => {
            if (card?.listing_status !== "listed") {
              router.push({
                pathname: "/listings/create",
                params: { inventoryId: card?.id },
              });
            }
          }}
          activeOpacity={card?.listing_status === "listed" ? 1 : 0.85}
          disabled={card?.listing_status === "listed"}
        >
          <Text 
            style={[
              styles.listBtnText, 
              card?.listing_status === "listed" && { color: "#555555" }
            ]}
          >
            {card?.listing_status === "listed" ? "Listed" : "List for Sale"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => router.push("/sell/scan")}
          activeOpacity={0.85}
        >
          <Text style={styles.sellBtnText}>Quick Sell</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backText: { color: "white", fontSize: 28 },
  headerTitle: { color: "white", fontSize: 17, fontWeight: "600" },
  imageArea: {
    height: 280,
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  imageInitials: { color: "#2A2A2A", fontSize: 64, fontWeight: "900" },
  certBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  certText: { color: "#555555", fontSize: 11 },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 14,
  },
  detailLabel: { color: "#555555", fontSize: 13 },
  detailValue: { color: "white", fontSize: 13, fontWeight: "600" as const },
  playerName: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
    textAlign: "center",
  },
  cardSubtitle: { color: "#888888", fontSize: 14, marginBottom: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  statCell: {
    width: "47%",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: { fontSize: 16, fontWeight: "700" },
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
  saleRowBorder: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  salePrice: { color: "white", fontWeight: "700", fontSize: 15, flex: 1 },
  platformBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 12,
  },
  platformBadgeText: { fontSize: 11, fontWeight: "700" },
  saleDate: { color: "#555555", fontSize: 12 },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  platformName: { color: "white", fontWeight: "600", fontSize: 14 },
  platformAvg: { color: "white", fontSize: 14, fontWeight: "700" },
  platformLowest: { color: "#888888", fontSize: 11, marginTop: 2 },
  aiCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#E8001C",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  listBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#0057FF",
    alignItems: "center",
    justifyContent: "center",
  },
  listBtnText: { color: "#0057FF", fontWeight: "700", fontSize: 15 },
  sellBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#E8001C",
    alignItems: "center",
    justifyContent: "center",
  },
  sellBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
});
