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
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useInventoryItem } from "../../src/hooks/useCardScan";
import { format } from "date-fns";
import type { EbaySoldItem, EbaySearchItem } from "../../src/services/cardService";
import { isGraded } from "../../src/utils/gradeHelper";

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

const STEP_PCT = "40%";

// Cleaning helper to strip out grading terms from search keywords
function cleanQueryString(query: string): string {
  if (!query) return "";
  return query
    .replace(/\b(psa|bgs|sgc|cgc)\b\s*\d+(\.\d+)?/gi, "")
    .replace(/\b(psa|bgs|sgc|cgc|graded|slab|slabbed)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildEbayQuery(card: any): string {
  if (!card) return "";
  const query = [
    card.player_name, 
    card.year, 
    card.set_name, 
    card.variation !== "Base" ? card.variation : "", 
    card.is_autograph ? "Auto" : "",
    card.is_relic ? "Patch" : "",
    card.card_number ? `#${card.card_number}` : ""
  ].filter(Boolean).join(" ");
  
  return cleanQueryString(query);
}

function buildMyslabsQuery(card: any): string {
  if (!card) return "";
  return buildEbayQuery(card);
}

function buildGradeQuery(card: any, grade: string): string {
  if (!card) return "";
  const base = [
    card.player_name,
    card.year,
    card.set_name,
    card.variation !== "Base" ? card.variation : "",
    card.card_number ? `#${card.card_number}` : ""
  ].filter(Boolean).join(" ");

  const cleanedBase = cleanQueryString(base);

  if (grade === "RAW") {
    return `${cleanedBase} RAW`;
  }

  const company = card.grading?.company || "PSA";
  return `${cleanedBase} ${company} ${grade}`;
}

function calcAvg(items: EbaySoldItem[]): number {
  if (!items.length) return 0;
  const prices = items
    .map((i) => parseFloat(i.soldPrice?.value ?? "0"))
    .filter((v) => v > 0);
  if (!prices.length) return 0;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

function calcMedian(items: EbaySoldItem[]): number {
  if (!items.length) return 0;
  const prices = items
    .map((i) => parseFloat(i.soldPrice?.value ?? "0"))
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
        Buying at {Math.round(ratio * 100)}% of 30d median comp
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [formPlayerName, setFormPlayerName] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formManufacturer, setFormManufacturer] = useState("");
  const [formSetName, setFormSetName] = useState("");
  const [formVariation, setFormVariation] = useState("");
  const [formCardNumber, setFormCardNumber] = useState("");
  const [formGradingCompany, setFormGradingCompany] = useState("");
  const [formGrade, setFormGrade] = useState("");

  const [compsByGrade, setCompsByGrade] = useState<Record<string, { active: any[], sold30d: any[], sold7d: any[] }>>({});
  const [myslabsCompsByGrade, setMyslabsCompsByGrade] = useState<Record<string, { active: any[], sold30d: any[], sold7d: any[] }>>({});
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [selectedGradeKey, setSelectedGradeKey] = useState<string>("RAW");

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

  const isExisting = Boolean(card?.isExisting);
  const { data: inventoryItemData } = useInventoryItem(isExisting ? (card?.id ?? "") : "");
  const activeCard = (isExisting && inventoryItemData) ? { ...card, ...inventoryItemData, isExisting: true } : card;

  useEffect(() => {
    if (card) {
      setFormPlayerName(card.player_name || "");
      setFormYear(card.year ? String(card.year) : "");
      setFormManufacturer(card.manufacturer || "");
      setFormSetName(card.set_name || "");
      setFormVariation(card.variation || "");
      setFormCardNumber(card.card_number || "");
      setFormGradingCompany(card.grading?.company || "");
      setFormGrade(card.grading?.grade || "");
    }
  }, [card]);

  // Auto show Edit Details Modal on mount for new cards to extract details
  useEffect(() => {
    if (card && !isExisting) {
      setShowEditModal(true);
    }
  }, [card?.id, isExisting]);

  const fetchCompsForAllGrades = async (cardInfo: any) => {
    if (!cardInfo || cardInfo.isExisting) return;

    const initialGrade = cardInfo.grading?.grade || "RAW";
    setSelectedGradeKey(initialGrade);
    setPrimaryLoading(true);

    try {
      const primaryEbayQuery = buildGradeQuery(cardInfo, initialGrade);
      const primaryMyslabsQuery = buildGradeQuery(cardInfo, initialGrade);

      console.log(`[COMPS] Fetching primary grade (${initialGrade}) query: ${primaryEbayQuery}`);

      const { cardService } = await import("../../src/services/cardService");
      const [ebayRes, myslabsRes] = await Promise.all([
        cardService.getEbaySold(primaryEbayQuery, 50, activeTab?.variantId, initialGrade),
        cardService.getMyslabsSold(primaryMyslabsQuery, 50, activeTab?.variantId, initialGrade)
      ]);

      setCompsByGrade(prev => ({
        ...prev,
        [initialGrade]: {
          active: ebayRes.activeListings || [],
          sold30d: ebayRes.sold30d?.items || [],
          sold7d: ebayRes.sold7d?.items || [],
        }
      }));

      setMyslabsCompsByGrade(prev => ({
        ...prev,
        [initialGrade]: {
          active: myslabsRes.activeListings || [],
          sold30d: myslabsRes.sold30d?.items || [],
          sold7d: myslabsRes.sold7d?.items || [],
        }
      }));

      setPrimaryLoading(false);

      // Fetch other grades in the background
      const otherGrades = gradesList.filter(g => g !== initialGrade);
      for (const grade of otherGrades) {
        const ebayQ = buildGradeQuery(cardInfo, grade);
        const myslabsQ = buildGradeQuery(cardInfo, grade);

        Promise.all([
          cardService.getEbaySold(ebayQ, 50, activeTab?.variantId, grade),
          cardService.getMyslabsSold(myslabsQ, 50, activeTab?.variantId, grade)
        ]).then(([eRes, mRes]) => {
          setCompsByGrade(prev => ({
            ...prev,
            [grade]: {
              active: eRes.activeListings || [],
              sold30d: eRes.sold30d?.items || [],
              sold7d: eRes.sold7d?.items || [],
            }
          }));

          setMyslabsCompsByGrade(prev => ({
            ...prev,
            [grade]: {
              active: mRes.activeListings || [],
              sold30d: mRes.sold30d?.items || [],
              sold7d: mRes.sold7d?.items || [],
            }
          }));
        }).catch(err => {
          console.warn(`[COMPS] Background fetch failed for grade ${grade}:`, err);
        });
      }

    } catch (err) {
      console.error("[COMPS] Primary fetch failed:", err);
      setPrimaryLoading(false);
    }
  };

  // Run comps fetch if already confirmed (or when details saved)
  useEffect(() => {
    if (card && !isExisting && !showEditModal) {
      fetchCompsForAllGrades(card);
    }
  }, [card?.id, isExisting, showEditModal]);

  const handleSaveDetails = () => {
    const updatedCard = {
      ...card,
      player_name: formPlayerName,
      year: formYear,
      manufacturer: formManufacturer,
      set_name: formSetName,
      variation: formVariation,
      card_number: formCardNumber,
      grading: formGradingCompany || formGrade 
        ? { company: formGradingCompany, grade: formGrade, cert_number: card?.grading?.cert_number || "" } 
        : undefined,
    };

    updateTab(activeTab.id, { cardData: updatedCard });
    setShowEditModal(false);
    fetchCompsForAllGrades(updatedCard);
  };

  const [salesVisibleCount, setSalesVisibleCount] = useState(20);
  const [activeVisibleCount, setActiveVisibleCount] = useState(20);
  const [compsSourceTab, setCompsSourceTab] = useState<"ebay_sold" | "ebay_active" | "myslabs_sold" | "myslabs_active">("ebay_sold");

  const currentComps = compsByGrade[selectedGradeKey] || { active: [], sold30d: [], sold7d: [] };
  const currentMyslabsComps = myslabsCompsByGrade[selectedGradeKey] || { active: [], sold30d: [], sold7d: [] };

  let ebayActive = currentComps.active.map(i => ({ ...i, platform: "eBay", displayPrice: i.price?.value }));
  let myslabsActive = currentMyslabsComps.active.map(i => ({ ...i, platform: "MySlabs", displayPrice: i.price?.value ?? i.soldPrice?.value }));

  let ebaySold30 = currentComps.sold30d.map(i => ({ ...i, platform: "eBay" }));
  let myslabsSold30 = currentMyslabsComps.sold30d.map(i => ({ ...i, platform: "MySlabs" }));

  let ebaySold7 = currentComps.sold7d.map(i => ({ ...i, platform: "eBay" }));
  let myslabsSold7 = currentMyslabsComps.sold7d.map(i => ({ ...i, platform: "MySlabs" }));

  if (isExisting && activeCard) {
    try {
      let rawEbayActive = [];
      let rawMyslabsActive = [];
      let rawEbaySold = [];
      let rawMyslabsSold = [];

      if (typeof activeCard.ebay_active_listings === "string") rawEbayActive = JSON.parse(activeCard.ebay_active_listings);
      if (typeof activeCard.myslabs_active_listings === "string") rawMyslabsActive = JSON.parse(activeCard.myslabs_active_listings);
      if (typeof activeCard.ebay_sales_completed === "string") rawEbaySold = JSON.parse(activeCard.ebay_sales_completed);
      if (typeof activeCard.myslabs_sales_completed === "string") rawMyslabsSold = JSON.parse(activeCard.myslabs_sales_completed);

      const allActive = [...rawEbayActive, ...rawMyslabsActive];
      const allSold = [...rawEbaySold, ...rawMyslabsSold];

      ebayActive = allActive.filter(i => !i.platform || i.platform.toLowerCase() === 'ebay').map(i => ({ ...i, platform: 'eBay' }));
      myslabsActive = allActive.filter(i => i.platform && i.platform.toLowerCase() === 'myslabs').map(i => ({ ...i, platform: 'MySlabs' }));

      ebaySold30 = allSold.filter(i => !i.platform || i.platform.toLowerCase() === 'ebay').map(i => ({ ...i, platform: 'eBay' }));
      myslabsSold30 = allSold.filter(i => i.platform && i.platform.toLowerCase() === 'myslabs').map(i => ({ ...i, platform: 'MySlabs' }));
      
      ebaySold7 = ebaySold30;
      myslabsSold7 = myslabsSold30;
    } catch (e) {
      console.warn("Failed to parse cached DB listings", e);
    }
  }

  // Filter comps client-side by exact selected grade score
  const filteredEbayActive = filterCompsByGrade(ebayActive, selectedGradeKey);
  const filteredMyslabsActive = filterCompsByGrade(myslabsActive, selectedGradeKey);
  const filteredEbaySold30 = filterCompsByGrade(ebaySold30, selectedGradeKey);
  const filteredMyslabsSold30 = filterCompsByGrade(myslabsSold30, selectedGradeKey);
  const filteredEbaySold7 = filterCompsByGrade(ebaySold7, selectedGradeKey);
  const filteredMyslabsSold7 = filterCompsByGrade(myslabsSold7, selectedGradeKey);

  const allActiveItems = [...filteredEbayActive, ...filteredMyslabsActive].sort((a, b) => parseFloat(a.displayPrice ?? "0") - parseFloat(b.displayPrice ?? "0"));
  const activeItems = allActiveItems.slice(0, activeVisibleCount);

  const sold30 = [...filteredEbaySold30, ...filteredMyslabsSold30].sort((a, b) => new Date((b as any).endDate ?? 0).getTime() - new Date((a as any).endDate ?? 0).getTime()) as any[];
  const sold7 = [...filteredEbaySold7, ...filteredMyslabsSold7].sort((a, b) => new Date((b as any).endDate ?? 0).getTime() - new Date((a as any).endDate ?? 0).getTime()) as any[];

  // Analytical stats
  let median30 = calcMedian(sold30 as any);
  let median7 = calcMedian(sold7 as any);

  if (isExisting && activeCard?.current_market_value) {
    median30 = parseFloat(activeCard.current_market_value);
    median7 = median30;
  }
  const trend = median30 > 0 ? ((median7 - median30) / median30) * 100 : 0;
  const sparklineData = sold30
    .slice(0, 8)
    .map((i) => parseFloat(i.soldPrice?.value ?? "0"))
    .reverse();
  const maxSpark = Math.max(...sparklineData, 1);

  // Min / Max and date calculations for pricing metadata
  const priceValues = sold30.map(i => parseFloat(i.soldPrice?.value ?? "0")).filter(v => v > 0);
  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;

  const dates = sold30.map(i => new Date(i.endDate)).filter(d => !isNaN(d.getTime()));
  const dateRangeStr = dates.length 
    ? `${safeFormatDate(Math.min(...dates.map(d => d.getTime())))} - ${safeFormatDate(Math.max(...dates.map(d => d.getTime())))}` 
    : "Last 30 Days";

  const isLoadingAll = !isExisting && primaryLoading;
  const isErrorAll = false;

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
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── CARD TITLE HEADER ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>
            {card?.year} {card?.set_name} {card?.player_name}
          </Text>
          <Text style={{ color: "#888888", fontSize: 13, marginTop: 4 }}>
            {card?.variation || "Base"} {card?.grading ? `· ${card.grading.company} ${card.grading.grade}` : "· RAW"}
          </Text>
        </View>

        {/* Grade Selector Pills */}
        <Text style={[styles.sectionLabel, { paddingHorizontal: 20, marginTop: 12 }]}>
          COMPARE OTHER GRADES
        </Text>
        <View style={{ marginVertical: 8 }}>
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

        {/* Loading / Error States */}
        {isLoadingAll && (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <ActivityIndicator color="#0057FF" size="large" />
            <Text style={{ color: "#888888", marginTop: 12, fontSize: 13 }}>
              Loading verification sales...
            </Text>
          </View>
        )}

        {isErrorAll && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={32} color="#E8001C" />
            <Text style={{ color: "#E8001C", fontWeight: "700", marginTop: 8, marginBottom: 8 }}>
              Failed to load comps
            </Text>
            <TouchableOpacity onPress={() => fetchCompsForAllGrades(card)}>
              <Text style={{ color: "#0057FF", fontWeight: "700" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoadingAll && !isErrorAll && (
          <>
            {sold30.length > 0 ? (
              <>
                {/* Stats Dashboard */}
                <View style={styles.avgBox}>
                  <Text style={styles.avgLabel}>
                    MEDIAN COMP PRICE ({selectedGradeKey === "RAW" ? "RAW" : `GRADE ${selectedGradeKey}`})
                  </Text>
                  <Text style={styles.avgValue}>
                    {median30 > 0 ? `$${median30.toFixed(2)}` : "—"}
                  </Text>
                  {median7 > 0 && median30 > 0 && (
                    <Text
                      style={{
                        color: trend >= 0 ? "#00C853" : "#E8001C",
                        fontSize: 13,
                        fontWeight: "700",
                        marginTop: 4,
                      }}
                    >
                      {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}% (7d vs 30d median)
                    </Text>
                  )}
                  
                  {/* Detailed Metadata Breakdown */}
                  <View style={styles.statsDivider} />
                  <View style={styles.statsList}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsLabel}>Average Price</Text>
                      <Text style={styles.statsValue}>
                        ${(sold30.reduce((acc, curr) => acc + parseFloat(curr.soldPrice?.value || "0"), 0) / sold30.length).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsLabel}>Sales Range</Text>
                      <Text style={styles.statsValue}>
                        ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsLabel}>Verified Sales</Text>
                      <Text style={styles.statsValue}>
                        {sold30.length} items
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsLabel}>Date Range</Text>
                      <Text style={styles.statsValue}>
                        {dateRangeStr}
                      </Text>
                    </View>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsLabel}>Comp Source</Text>
                      <Text style={[styles.statsValue, { color: "#0057FF" }]}>
                        eBay & MySlabs
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Sparkline pricing trend */}
                {sparklineData.length > 0 && (
                  <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                    <Text style={styles.sectionLabel}>30-DAY PRICE TREND</Text>
                    <View style={styles.sparklineContainer}>
                      {sparklineData.map((v, i) => (
                        <View key={i} style={{ flex: 1, alignItems: "center" }}>
                          <View
                            style={{
                              width: "100%",
                              height: Math.max((v / maxSpark) * 48, 4),
                              backgroundColor: i === sparklineData.length - 1 ? "#00C853" : "#0057FF",
                              borderRadius: 3,
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Deal Rating Calculator */}
                <DealRatingBadge buyPrice={activeTab?.price} avgComp={median30} />

                {/* Comps Source Tab Selector */}
                <View style={{ marginTop: 16, paddingBottom: 10 }}>
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
                            borderColor: isActive ? "#0057FF" : "#2A2A2A",
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

                {/* Tabular Lists */}
                <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                  {(() => {
                    let currentData: any[] = [];
                    if (compsSourceTab === "ebay_sold") {
                      currentData = filteredEbaySold30;
                    } else if (compsSourceTab === "ebay_active") {
                      currentData = filteredEbayActive;
                    } else if (compsSourceTab === "myslabs_sold") {
                      currentData = filteredMyslabsSold30;
                    } else if (compsSourceTab === "myslabs_active") {
                      currentData = filteredMyslabsActive;
                    }

                    if (currentData.length === 0) {
                      return (
                        <Text style={styles.noDataListText}>
                          No comps listing found for this tab.
                        </Text>
                      );
                    }

                    return (
                      <View style={styles.sectionCard}>
                        <View style={styles.tableHeader}>
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
                                  Linking.openURL(linkUrl).catch(err => console.error("Could not open URL", err));
                                }
                              }}
                              style={[
                                styles.saleRow,
                                i < currentData.length - 1 && styles.rowBorder,
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
                                      { backgroundColor: sale.platform === "eBay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)" },
                                    ]}
                                  >
                                    <Text
                                      style={[styles.platformBadgeText, { color: sale.platform === "eBay" ? "#0057FF" : "#E01F2B" }]}
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
            ) : (
              /* Verified Sales No Data Warning Message */
              <View style={styles.noDataWarningBox}>
                <Ionicons name="alert-circle" size={44} color="#FFB300" />
                <Text style={styles.noDataWarningTitle}>
                  No Exact Sales Data for {selectedGradeKey === "RAW" ? "RAW" : `GRADE ${selectedGradeKey}`}
                </Text>
                <Text style={styles.noDataWarningText}>
                  We could not find any verified comps transactions for this card matching the {selectedGradeKey === "RAW" ? "RAW" : `GRADE ${selectedGradeKey}`} grade.
                </Text>
                <Text style={styles.noDataWarningSubtitle}>
                  Please choose another grade from the selector above, or continue directly to enter a purchase price manually.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Persistent Action Footer */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (activeTab?.id) {
              const bestMatchItem = activeItems.find((item) => item.image?.imageUrl);
              const bestMatchImageUrl = bestMatchItem?.image?.imageUrl;

              // Propagate the updated grade configuration down to the pricing/confirm workflows
              let updatedGrading = null;
              if (selectedGradeKey !== "RAW") {
                updatedGrading = {
                  company: card?.grading?.company || "PSA",
                  grade: selectedGradeKey,
                };
              }

              updateTab(activeTab.id, {
                cardData: {
                  ...card,
                  grading: updatedGrading,
                },
                ...(median30 > 0 ? { avgComp: median30, recentSales: filteredEbaySold30, myslabsRecentSales: filteredMyslabsSold30 } : { avgComp: 0 }),
                bestMatchImageUrl,
                activeListings: filteredEbayActive.length > 0 ? filteredEbayActive : undefined,
                myslabsActiveListings: filteredMyslabsActive.length > 0 ? filteredMyslabsActive : undefined,
              });
            }
            router.push("/buy/price");
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>ENTER PRICE →</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Details Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Card Details</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={{ color: "#E8001C", fontSize: 16, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={styles.inputLabel}>Player Name</Text>
              <TextInput
                style={styles.textInput}
                value={formPlayerName}
                onChangeText={setFormPlayerName}
                placeholder="e.g. Zion Williamson"
                placeholderTextColor="#555"
              />

              <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                style={styles.textInput}
                value={formYear}
                onChangeText={setFormYear}
                placeholder="e.g. 2019"
                placeholderTextColor="#555"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Manufacturer</Text>
              <TextInput
                style={styles.textInput}
                value={formManufacturer}
                onChangeText={setFormManufacturer}
                placeholder="e.g. Panini"
                placeholderTextColor="#555"
              />

              <Text style={styles.inputLabel}>Set Name</Text>
              <TextInput
                style={styles.textInput}
                value={formSetName}
                onChangeText={setFormSetName}
                placeholder="e.g. Prizm"
                placeholderTextColor="#555"
              />

              <Text style={styles.inputLabel}>Parallel / Variation</Text>
              <TextInput
                style={styles.textInput}
                value={formVariation}
                onChangeText={setFormVariation}
                placeholder="e.g. Silver (or Base)"
                placeholderTextColor="#555"
              />

              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                value={formCardNumber}
                onChangeText={setFormCardNumber}
                placeholder="e.g. 248"
                placeholderTextColor="#555"
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Grading Co.</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formGradingCompany}
                    onChangeText={setFormGradingCompany}
                    placeholder="e.g. PSA, BGS, SGC"
                    placeholderTextColor="#555"
                    autoCapitalize="characters"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Grade</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formGrade}
                    onChangeText={setFormGrade}
                    placeholder="e.g. 10, 9.5, 9"
                    placeholderTextColor="#555"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDetails}>
                <Text style={styles.saveBtnText}>Save Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
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
  cardHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
  },
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
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  saleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    justifyContent: "space-between",
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  compThumbnail: {
    width: 36,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#222222",
  },
  compThumbnailPlaceholder: {
    width: 36,
    height: 50,
    backgroundColor: "#22",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  salePrice: { color: "white", fontWeight: "700", fontSize: 13 },
  saleDate: { color: "#555555", fontSize: 10, marginTop: 4 },
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
    marginRight: 0,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  platformBadgeText: {
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 9,
  },
  errorBox: {
    marginHorizontal: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  statsDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 16,
  },
  statsList: {
    width: "100%",
    gap: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsLabel: {
    color: "#888888",
    fontSize: 12,
  },
  statsValue: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  noDataListText: {
    color: "#555",
    fontSize: 13,
    marginTop: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  noDataWarningBox: {
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#332200",
  },
  noDataWarningTitle: {
    color: "#FFB300",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },
  noDataWarningText: {
    color: "#AAAAAA",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  noDataWarningSubtitle: {
    color: "#666666",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
    lineHeight: 16,
  },
  sparklineContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 56,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  inputLabel: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: "#1A1A1A",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  saveBtn: {
    backgroundColor: "#0057FF",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 30,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
