import React, { useState, useEffect } from "react";
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

function calcMedian(items: any[]): number {
  if (!items.length) return 0;
  const prices = items
    .map((i) => parseFloat(i.soldPrice?.value ?? i.price?.value ?? i.displayPrice ?? i.price ?? "0"))
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return 0;
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
}

// Client-side comps filtering by grade_key classification from the ML model
function filterCompsByGrade(items: any[], selectedGrade: string): any[] {
  return items.filter(item => {
    const title = (item.title || "").toUpperCase();
    const condition = (item.condition || "").toUpperCase();

    // 1. Explicit condition checks
    const isUngradedCondition = condition === "UNGRADED" || condition === "RAW";
    const isGradedCondition = condition === "GRADED" || condition === "SLABBED" || condition === "SLAB";

    // 2. Check if item has a grade_key field from DB cache (PSA_10 or numeric "10")
    const itemGrade = item.grade_key || "";
    if (itemGrade) {
      let parsedGrade = "RAW";
      if (itemGrade !== "RAW") {
        const numMatch = itemGrade.match(/_(\d+(?:\.\d+)?)$/);
        parsedGrade = numMatch ? numMatch[1] : (/^\d+(?:\.\d+)?$/.test(itemGrade) ? itemGrade : "RAW");
      }
      if (parsedGrade === selectedGrade) {
        if (selectedGrade !== "RAW" && isUngradedCondition) return false;
        return true;
      }
      return false;
    }

    // 3. Fallback/API: Filter based on listing title & condition matching the selected grade
    if (selectedGrade === "RAW") {
      if (isGradedCondition) return false;
      return !/\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title);
    } else {
      if (isUngradedCondition) return false;

      // Filter out titles indicating it is a raw card trying to sound graded
      if (/\b(READY|RAW|LOT|NOT\s+(?:PSA|BGS|SGC|CGC|CSG)|PSA\s*\?|\?\s*PSA)\b/i.test(title)) {
        return false;
      }

      // Graded card titles must contain a grading company and the exact grade number
      const hasGradingCompany = /\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title);
      if (!hasGradingCompany) return false;

      // Ensure the exact grade number is present.
      if (selectedGrade === "9") {
        // Avoid matching "9.5" when grade is "9"
        return /\b9\b/.test(title) && !/\b9\.5\b/.test(title);
      } else if (selectedGrade === "9.5") {
        return /\b9\.5\b/.test(title);
      } else if (selectedGrade === "10") {
        return /\b10\b/.test(title);
      } else {
        const escapedGrade = selectedGrade.replace(".", "\\.");
        const gradeRegex = new RegExp(`\\b${escapedGrade}\\b`);
        return gradeRegex.test(title);
      }
    }
  });
}

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
  const formattedLabel = gradeKey.replace(/_/g, " ");
  const cfg = configs[gradeKey] ?? {
    bg: "#2A2A2A",
    color: "#888888",
    label: formattedLabel,
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

  const [selectedGradeKey, setSelectedGradeKey] = useState<string>("RAW");
  const [compsSourceTab, setCompsSourceTab] = useState<"ebay_sold" | "ebay_active" | "myslabs_sold" | "myslabs_active">("ebay_sold");
  const [salesVisibleCount, setSalesVisibleCount] = useState(20);
  const [activeVisibleCount, setActiveVisibleCount] = useState(20);

  // Initialize selected grade key to card's actual inventory grade on load
  useEffect(() => {
    if (card?.grade_key) {
      if (card.grade_key === "RAW") {
        setSelectedGradeKey("RAW");
      } else {
        const match = card.grade_key.match(/[\d\.]+/);
        setSelectedGradeKey(match ? match[0] : "RAW");
      }
    }
  }, [card]);

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

  // Parsing JSON comps datasets cached on DB
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

  // Filtering comps dynamically client-side by exact selectedGradeKey
  const filteredEbaySales = filterCompsByGrade(localEbaySales, selectedGradeKey);
  const filteredMyslabsSales = filterCompsByGrade(localMyslabsSales, selectedGradeKey);
  const filteredEbayActive = filterCompsByGrade(localEbayActive, selectedGradeKey);
  const filteredMyslabsActive = filterCompsByGrade(localMyslabsActive, selectedGradeKey);

  const sortedEbaySales = filteredEbaySales.filter((s: any) => parseFloat(s.soldPrice?.value ?? "0") > 0).sort((a: any, b: any) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());
  const sortedMyslabsSales = filteredMyslabsSales.filter((s: any) => parseFloat(s.soldPrice?.value ?? "0") > 0).sort((a: any, b: any) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());

  const sortedEbayActive = filteredEbayActive.sort((a: any, b: any) => parseFloat(a.price?.value ?? "0") - parseFloat(b.price?.value ?? "0"));
  const sortedMyslabsActive = filteredMyslabsActive.sort((a: any, b: any) => parseFloat(a.price?.value ?? a.soldPrice?.value ?? "0") - parseFloat(b.price?.value ?? b.soldPrice?.value ?? "0"));

  const soldCompsForSelectedGrade = [...sortedEbaySales, ...sortedMyslabsSales].sort((a: any, b: any) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());

  const gradesList = [
    "RAW",
    "5",
    "6",
    "7",
    "8",
    "9",
    "9.5",
    "10",
  ];

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

        {/* Comps Compare Dashboard */}
        {allSales.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={styles.sectionLabel}>COMPARE OTHER GRADES</Text>
            <View style={{ marginVertical: 8, marginHorizontal: -20 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
              >
                {gradesList.map((item) => {
                  const isSelected = selectedGradeKey === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setSelectedGradeKey(item)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        backgroundColor: isSelected ? "#0057FF" : "#1A1A1A",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isSelected ? "#0057FF" : "#2D2D2D",
                      }}
                    >
                      <Text style={{ color: isSelected ? "white" : "#AAAAAA", fontSize: 13, fontWeight: "700" }}>
                        {item === "RAW" ? "RAW" : `GRADE ${item}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Selected Grade Metrics / Warning Fallback */}
            {soldCompsForSelectedGrade.length > 0 ? (
              <View style={styles.avgBox}>
                <Text style={styles.avgLabel}>
                  MEDIAN COMP PRICE ({selectedGradeKey === "RAW" ? "RAW" : `GRADE ${selectedGradeKey}`})
                </Text>
                <Text style={styles.avgValue}>
                  ${calcMedian(soldCompsForSelectedGrade).toFixed(2)}
                </Text>
                <Text style={{ color: "#555555", fontSize: 11, marginTop: 4 }}>
                  {soldCompsForSelectedGrade.length} verified sales found
                </Text>
              </View>
            ) : (
              <View style={styles.noDataWarningBox}>
                <Ionicons name="alert-circle-outline" size={32} color="#FFB300" />
                <Text style={styles.noDataWarningTitle}>
                  No exact comps for {selectedGradeKey === "RAW" ? "RAW" : `GRADE ${selectedGradeKey}`}
                </Text>
                <Text style={styles.noDataWarningText}>
                  We do not have any cached verified comps for this grade.
                </Text>
              </View>
            )}

            {/* Comps Source Tabs (only shown when data exists for the chosen grade) */}
            {soldCompsForSelectedGrade.length > 0 && (
              <>
                <View style={{ paddingBottom: 10, marginHorizontal: -20, marginTop: 16 }}>
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

                {/* Tabular List */}
                <View style={{ marginTop: 8 }}>
                  {(() => {
                    let currentData: any[] = [];
                    if (compsSourceTab === "ebay_sold") {
                      currentData = sortedEbaySales;
                    } else if (compsSourceTab === "ebay_active") {
                      currentData = sortedEbayActive;
                    } else if (compsSourceTab === "myslabs_sold") {
                      currentData = sortedMyslabsSales;
                    } else if (compsSourceTab === "myslabs_active") {
                      currentData = sortedMyslabsActive;
                    }

                    if (currentData.length === 0) {
                      return (
                        <Text style={{ color: "#555", fontSize: 13, marginTop: 16, fontStyle: "italic", textAlign: "center" }}>
                          No data found for this tab.
                        </Text>
                      );
                    }

                    return (
                      <View style={styles.sectionCard}>
                        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 8, marginBottom: 8, paddingHorizontal: 14, paddingTop: 14 }}>
                          <Text style={{ flex: 0.15, color: "#888", fontSize: 10, fontWeight: "600" }}>IMG</Text>
                          <Text style={{ flex: 0.55, color: "#888", fontSize: 10, fontWeight: "600", paddingLeft: 8 }}>TITLE & COND.</Text>
                          <Text style={{ flex: 0.3, color: "#888", fontSize: 10, fontWeight: "600", textAlign: "right" }}>PRICE & DATE</Text>
                        </View>
                        
                        {currentData.slice(0, compsSourceTab.includes("sold") ? salesVisibleCount : activeVisibleCount).map((sale, i) => {
                          const displayPrice = sale.soldPrice?.value ?? sale.price?.value ?? sale.displayPrice ?? "0";
                          const linkUrl = getListingUrl(sale);
                          return (
                            <TouchableOpacity
                              key={`comp-${sale.platform || ""}-${sale.itemId || ""}-${i}`}
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
                                    style={styles.compThumbnail}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={styles.compThumbnailPlaceholder}>
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
                                <Text style={styles.salePrice}>
                                  ${parseFloat(displayPrice).toFixed(2)}
                                </Text>
                                <Text style={styles.saleDate}>
                                  {compsSourceTab.includes("sold") ? safeFormatDate(sale.endDate) : "Active"}
                                </Text>
                                {sale.platform && (
                                  <View
                                    style={[
                                      styles.platformBadge,
                                      { backgroundColor: sale.platform?.toLowerCase() === "ebay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)" },
                                    ]}
                                  >
                                    <Text
                                      style={[styles.platformBadgeText, { color: sale.platform?.toLowerCase() === "ebay" ? "#0057FF" : "#E01F2B" }]}
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
              </>
            )}
          </View>
        )}

        {allSales.length === 0 && sortedEbayActive.length === 0 && sortedMyslabsActive.length === 0 && !!card.player_name && (
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  detailLabel: { color: "#555555", fontSize: 13 },
  detailValue: { color: "white", fontSize: 13, fontWeight: "600" },
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
  compThumbnail: {
    width: 36,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#222222",
  },
  compThumbnailPlaceholder: {
    width: 36,
    height: 50,
    backgroundColor: "#222",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  salePrice: { color: "white", fontWeight: "700", fontSize: 13 },
  platformBadge: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 0,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  platformBadgeText: { 
    fontWeight: "800", 
    textTransform: "uppercase", 
    fontSize: 9 
  },
  saleDate: { color: "#555555", fontSize: 10, marginTop: 4 },
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
  avgBox: {
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
  avgValue: { color: "white", fontSize: 30, fontWeight: "900" },
  noDataWarningBox: {
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#332200",
    marginBottom: 16,
  },
  noDataWarningTitle: {
    color: "#FFB300",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  noDataWarningText: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
