import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,

  Image,
  Modal,
  TextInput,
  Alert,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as ImagePicker from "expo-image-picker";
import { useInventoryItem, QUERY_KEYS } from "../../src/hooks/useCardScan";
import RSLLoader from "../../src/components/RSLLoader";
import { inventoryService } from "../../src/services/cardService";
import { useAuthStore } from "../../src/stores/authStore";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useQueryClient } from "@tanstack/react-query";
import { isGraded } from "../../src/utils/gradeHelper";
import { format, isValid } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { CustomAlertModal } from "../../src/components/ui/CustomAlertModal";

const safeFormatDate = (dateVal: string | number | undefined | null) => {
  if (!dateVal) return "—";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy");
};

const getListingUrl = (sale: any) => {
  if (!sale || typeof sale !== "object") return null;
  if (sale.itemWebUrl) return sale.itemWebUrl;
  if (sale.slab_link) return sale.slab_link;
  if (sale.itemId && sale.platform) {
    if (String(sale.platform).toLowerCase() === "ebay") return `https://www.ebay.com/itm/${sale.itemId}`;
    if (String(sale.platform).toLowerCase() === "myslabs") return `https://myslabs.com/slab/view/${sale.itemId}`;
  }
  if (sale.id && sale.platform && String(sale.platform).toLowerCase() === "myslabs") {
    return `https://myslabs.com/slab/view/${sale.id}`;
  }
  return null;
};

function getCompPrice(item: any): number {
  if (!item || typeof item !== "object") return 0;
  if (typeof item.price === "number" && !isNaN(item.price)) return item.price;
  if (typeof item.soldPrice === "number" && !isNaN(item.soldPrice)) return item.soldPrice;
  if (item.soldPrice?.value != null) {
    const p = parseFloat(String(item.soldPrice.value));
    if (!isNaN(p)) return p;
  }
  if (item.price?.value != null) {
    const p = parseFloat(String(item.price.value));
    if (!isNaN(p)) return p;
  }
  if (item.price != null && typeof item.price !== "object") {
    const p = parseFloat(String(item.price));
    if (!isNaN(p)) return p;
  }
  return 0;
}

function getCompImage(item: any): string | null {
  if (!item || typeof item !== "object") return null;
  if (item.image?.imageUrl) return item.image.imageUrl;
  if (item.slab_image_1) return item.slab_image_1;
  if (item.slab_image_1_thumbnail) return item.slab_image_1_thumbnail;
  if (item.photo) return item.photo;
  return null;
}

function fmtNum(val: any): string {
  const n = parseFloat(String(val ?? 0));
  return isNaN(n) ? "0.00" : n.toFixed(2);
}

function calcMedian(items: any[]): number {
  if (!Array.isArray(items) || !items.length) return 0;
  const prices = items
    .map((i) => getCompPrice(i))
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return 0;
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
}

function safeParseJson(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
      return [];
    } catch {
      return [];
    }
  }
  if (typeof val === "object") return [val];
  return [];
}

// Client-side comps filtering by grade_key classification from the ML model
function filterCompsByGrade(items: any[], selectedGrade: string): any[] {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    if (!item || typeof item !== "object") return false;
    const title = String(item.title || "").toUpperCase();
    const condition = String(item.condition || "").toUpperCase();

    const isUngradedCondition = condition === "UNGRADED" || condition === "RAW";
    const isGradedCondition = condition === "GRADED" || condition === "SLABBED" || condition === "SLAB";

    const itemGrade = String(item.grade_key || "");
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

    if (selectedGrade === "RAW") {
      if (isGradedCondition) return false;
      return !/\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title);
    } else {
      if (isUngradedCondition) return false;

      if (/\b(READY|RAW|LOT|NOT\s+(?:PSA|BGS|SGC|CGC|CSG)|PSA\s*\?|\?\s*PSA)\b/i.test(title)) {
        return false;
      }

      const hasGradingCompany = /\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title);
      if (!hasGradingCompany) return false;

      if (selectedGrade === "9") {
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

function getGradeConfig(gradeKey?: string, item?: any) {
  const company = (item?.grade_company || item?.gradeCompany || '').toUpperCase().trim()
  const value = (item?.grade_value || item?.gradeValue || '').trim()

  if (gradeKey === 'RAW' || company === 'RAW') {
    return { bg: "#2A2A2A", color: "#888888", label: "RAW" }
  }

  let finalCompany = company || 'PSA'
  let finalValue = value

  if (gradeKey) {
    if (gradeKey.includes('_')) {
      const parts = gradeKey.split('_')
      if (!company) finalCompany = parts[0].toUpperCase()
      if (!value) finalValue = parts.slice(1).join('.')
    } else if (gradeKey.includes(' ')) {
      const parts = gradeKey.split(' ')
      if (!company) finalCompany = parts[0].toUpperCase()
      if (!value) finalValue = parts.slice(1).join('.')
    } else if (/^\d+(?:\.\d+)?$/.test(gradeKey.trim())) {
      if (!company) finalCompany = 'PSA'
      if (!value) finalValue = gradeKey.trim()
    }
  }

  if (!finalValue && gradeKey) {
    finalValue = gradeKey
  }

  const label = `${finalCompany} ${finalValue}`.trim()

  let bg = "#1A1A1A"
  let color = "#FFD700"

  if (finalCompany === 'PSA') {
    if (finalValue === '10') {
      bg = "#FFD700"
      color = "#000000"
    } else {
      bg = "#1A1A1A"
      color = "#FFD700"
    }
  } else if (finalCompany === 'BGS') {
    bg = "#0057FF"
    color = "#FFFFFF"
  } else if (finalCompany === 'SGC') {
    bg = "#1A1A1A"
    color = "#00C853"
  } else if (finalCompany === 'CGC') {
    bg = "#0088FF"
    color = "#FFFFFF"
  }

  return { bg, color, label }
}

function GradeChip({ gradeKey, item }: { gradeKey?: string; item?: any }) {
  const cfg = getGradeConfig(gradeKey, item)
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
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? "");
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: card, isLoading, isError } = useInventoryItem(id ?? "");

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const [selectedGradeKey, setSelectedGradeKey] = useState<string>("RAW");
  const [compsSourceTab, setCompsSourceTab] = useState<"ebay_sold" | "ebay_active" | "myslabs_sold" | "myslabs_active">("ebay_sold");
  const [salesVisibleCount, setSalesVisibleCount] = useState(20);
  const [activeVisibleCount, setActiveVisibleCount] = useState(20);

  // Modals state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editCompany, setEditCompany] = useState("PSA");
  const [editValue, setEditValue] = useState("10");
  const [isUpdatingGrade, setIsUpdatingGrade] = useState(false);

  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [editCostBasis, setEditCostBasis] = useState("");
  const [editTargetPrice, setEditTargetPrice] = useState("");
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Image Edit Handlers
  const handlePickGalleryImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow photo library access to upload a card photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setIsUpdatingImage(true);
        const uploaded = await inventoryService.uploadPhotoDirect(id ?? "", result.assets[0].uri);
        
        queryClient.setQueryData([...QUERY_KEYS.inventory(userId), "item", id], (old: any) => {
          if (!old) return old;
          return { ...old, photos: [uploaded.url] };
        });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory(userId) });
        setShowImageModal(false);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to upload photo");
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleSaveImageUrl = async () => {
    if (!imageUrlInput.trim()) return;
    setIsUpdatingImage(true);
    try {
      await inventoryService.updateItem(id ?? "", { photos: [imageUrlInput.trim()] });
      queryClient.setQueryData([...QUERY_KEYS.inventory(userId), "item", id], (old: any) => {
        if (!old) return old;
        return { ...old, photos: [imageUrlInput.trim()] };
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory(userId) });
      setShowImageModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update image URL");
    } finally {
      setIsUpdatingImage(false);
    }
  };

  // Grade Edit Handler
  const handleSaveGrade = async () => {
    setIsUpdatingGrade(true);
    try {
      const company = editCompany.toUpperCase().trim();
      const val = editValue.trim();
      const key = company === "RAW" || val === "RAW" ? "RAW" : `${company}_${val.replace(".", "")}`;

      await inventoryService.updateItem(id ?? "", {
        gradeCompany: company,
        gradeValue: val,
        gradeKey: key,
      });

      const numMatch = val.match(/[\d\.]+/);
      if (numMatch && company !== "RAW") {
        setSelectedGradeKey(numMatch[0]);
      } else {
        setSelectedGradeKey("RAW");
      }

      queryClient.setQueryData([...QUERY_KEYS.inventory(userId), "item", id], (old: any) => {
        if (!old) return old;
        return { ...old, grade_company: company, grade_value: val, grade_key: key };
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory(userId) });
      setShowGradeModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update grade");
    } finally {
      setIsUpdatingGrade(false);
    }
  };

  // Metrics Edit Handler
  const handleSaveMetrics = async () => {
    const cost = parseFloat(editCostBasis);
    const market = parseFloat(editTargetPrice);
    if (isNaN(cost) || isNaN(market)) {
      Alert.alert("Invalid Input", "Please enter valid numbers for cost and target price.");
      return;
    }

    setIsUpdatingMetrics(true);
    try {
      await inventoryService.updateItem(id ?? "", {
        costBasis: cost,
        currentMarketValue: market,
      });

      queryClient.setQueryData([...QUERY_KEYS.inventory(userId), "item", id], (old: any) => {
        if (!old) return old;
        return { ...old, cost_basis: String(cost), current_market_value: String(market) };
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory(userId) });
      setShowMetricsModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update pricing metrics");
    } finally {
      setIsUpdatingMetrics(false);
    }
  };

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
        <RSLLoader size={48} />
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
  const rawEbaySales = safeParseJson(card.ebay_sales_completed);
  const rawMyslabsSales = safeParseJson(card.myslabs_sales_completed);
  const rawEbayActive = safeParseJson(card.ebay_active_listings);
  const rawMyslabsActive = safeParseJson(card.myslabs_active_listings);

  const allSales = [...rawEbaySales, ...rawMyslabsSales];
  const allActive = [...rawEbayActive, ...rawMyslabsActive];

  const localEbaySales = allSales.filter((i: any) => i && typeof i === "object" && (!i.platform || String(i.platform).toLowerCase() === 'ebay')).map((i: any) => ({ ...i, platform: 'eBay' }));
  const localMyslabsSales = allSales.filter((i: any) => i && typeof i === "object" && i.platform && String(i.platform).toLowerCase() === 'myslabs').map((i: any) => ({ ...i, platform: 'MySlabs' }));

  const localEbayActive = allActive.filter((i: any) => i && typeof i === "object" && (!i.platform || String(i.platform).toLowerCase() === 'ebay')).map((i: any) => ({ ...i, platform: 'eBay' }));
  const localMyslabsActive = allActive.filter((i: any) => i && typeof i === "object" && i.platform && String(i.platform).toLowerCase() === 'myslabs').map((i: any) => ({ ...i, platform: 'MySlabs' }));

  // Filtering comps dynamically client-side by exact selectedGradeKey
  const filteredEbaySales = filterCompsByGrade(localEbaySales, selectedGradeKey);
  const filteredMyslabsSales = filterCompsByGrade(localMyslabsSales, selectedGradeKey);
  const filteredEbayActive = filterCompsByGrade(localEbayActive, selectedGradeKey);
  const filteredMyslabsActive = filterCompsByGrade(localMyslabsActive, selectedGradeKey);

  const sortedEbaySales = filteredEbaySales.filter((s: any) => getCompPrice(s) > 0).sort((a: any, b: any) => new Date(b.endDate ?? b.sold_date ?? 0).getTime() - new Date(a.endDate ?? a.sold_date ?? 0).getTime());
  const sortedMyslabsSales = filteredMyslabsSales.filter((s: any) => getCompPrice(s) > 0).sort((a: any, b: any) => new Date(b.endDate ?? b.sold_date ?? 0).getTime() - new Date(a.endDate ?? a.sold_date ?? 0).getTime());

  const sortedEbayActive = filteredEbayActive.sort((a: any, b: any) => getCompPrice(a) - getCompPrice(b));
  const sortedMyslabsActive = filteredMyslabsActive.sort((a: any, b: any) => getCompPrice(a) - getCompPrice(b));

  const soldCompsForSelectedGrade = [...sortedEbaySales, ...sortedMyslabsSales].sort((a: any, b: any) => new Date(b.endDate ?? b.sold_date ?? 0).getTime() - new Date(a.endDate ?? a.sold_date ?? 0).getTime());

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0057FF"
            colors={["#0057FF"]}
          />
        }
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
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
            style={{ width: 40, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Card image with Edit Button */}
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

          {/* Edit Image Button Overlay */}
          <TouchableOpacity
            onPress={() => {
              setImageUrlInput(card.photos?.[0] || "");
              setShowImageModal(true);
            }}
            style={styles.editImageBtn}
          >
            <Ionicons name="camera-outline" size={13} color="#0057FF" />
            <Text style={styles.editImageBtnText}>Edit</Text>
          </TouchableOpacity>

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

        {/* Player info & Grade Chip with Edit Button */}
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

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <GradeChip gradeKey={card.grade_key} item={card} />
            <TouchableOpacity
              onPress={() => {
                setEditCompany(card.grade_company || "PSA");
                setEditValue(card.grade_value || "10");
                setShowGradeModal(true);
              }}
              style={styles.editGradeBtn}
            >
              <Ionicons name="pencil-outline" size={13} color="#FFB300" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats grid with Edit Option */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setEditCostBasis(String(costBasis));
              setEditTargetPrice(String(marketValue));
              setShowMetricsModal(true);
            }}
            style={[styles.statCell, { position: "relative" }]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Text style={styles.statLabel}>Cost Basis</Text>
              <Ionicons name="pencil-outline" size={12} color="#888888" />
            </View>
            <Text style={[styles.statValue, { color: "#888888" }]}>${costBasis.toFixed(2)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setEditCostBasis(String(costBasis));
              setEditTargetPrice(String(marketValue));
              setShowMetricsModal(true);
            }}
            style={[styles.statCell, { position: "relative" }]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Text style={styles.statLabel}>Your Target Price</Text>
              <Ionicons name="pencil-outline" size={12} color="#0057FF" />
            </View>
            <Text style={[styles.statValue, { color: "white" }]}>
              {marketValue > 0 ? `$${marketValue.toFixed(2)}` : "—"}
            </Text>
          </TouchableOpacity>

          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Days Held</Text>
            <Text style={[styles.statValue, { color: daysHeld >= 60 ? "#FFB300" : "white" }]}>
              {daysHeld}d
            </Text>
          </View>

          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Unrealized P&amp;L</Text>
            <Text style={[styles.statValue, { color: marketValue > 0 ? gainColor : "#555555" }]}>
              {marketValue > 0
                ? `${unrealizedGain >= 0 ? "+" : ""}$${unrealizedGain.toFixed(2)} (${unrealizedGainPct >= 0 ? "+" : ""}${unrealizedGainPct}%)`
                : "—"}
            </Text>
          </View>
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
        {(allSales.length > 0 || allActive.length > 0) && (
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
                  No exact sales comps for {selectedGradeKey === "RAW" ? "RAW" : `GRADE ${selectedGradeKey}`}
                </Text>
                <Text style={styles.noDataWarningText}>
                  We do not have any cached verified sales comps for this grade.
                </Text>
              </View>
            )}

            {/* Comps Source Tabs (shown when sales or active listings exist) */}
            {(soldCompsForSelectedGrade.length > 0 || sortedEbayActive.length > 0 || sortedMyslabsActive.length > 0) && (
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

                {/* Comps Listings Output */}
                <View style={styles.sectionCard}>
                  {compsSourceTab === "ebay_sold" && (
                    sortedEbaySales.length > 0 ? (
                      sortedEbaySales.slice(0, salesVisibleCount).map((sale: any, i: number, arr: any[]) => {
                        const price = getCompPrice(sale);
                        const imgUri = getCompImage(sale);
                        const dateStr = safeFormatDate(sale.endDate ?? sale.sold_date);
                        const url = getListingUrl(sale);

                        return (
                          <TouchableOpacity
                            key={sale.itemId || sale.id || i}
                            activeOpacity={0.7}
                            onPress={() => url && WebBrowser.openBrowserAsync(url)}
                            style={[
                              styles.saleRow,
                              i < arr.length - 1 && styles.saleRowBorder,
                            ]}
                          >
                            {imgUri ? (
                              <Image
                                source={{ uri: imgUri }}
                                style={styles.compThumbnail}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.compThumbnailPlaceholder}>
                                <Text style={{ color: "#444", fontSize: 16 }}>📷</Text>
                              </View>
                            )}

                            <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                              <Text
                                numberOfLines={2}
                                style={{ color: "#DDD", fontSize: 12, fontWeight: "500" }}
                              >
                                {sale.title}
                              </Text>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={[styles.platformBadge, { backgroundColor: "#E53238" }]}>
                                  <Text style={[styles.platformBadgeText, { color: "#FFF" }]}>eBay</Text>
                                </View>
                                <Text style={[styles.saleDate, { marginLeft: 8 }]}>{dateStr}</Text>
                              </View>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={styles.salePrice}>${fmtNum(price)}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ color: "#666", fontSize: 13 }}>No eBay sold comps found for this grade.</Text>
                      </View>
                    )
                  )}

                  {compsSourceTab === "ebay_active" && (
                    sortedEbayActive.length > 0 ? (
                      sortedEbayActive.slice(0, activeVisibleCount).map((item: any, i: number, arr: any[]) => {
                        const price = getCompPrice(item);
                        const imgUri = getCompImage(item);
                        const url = getListingUrl(item);

                        return (
                          <TouchableOpacity
                            key={item.itemId || item.id || i}
                            activeOpacity={0.7}
                            onPress={() => url && WebBrowser.openBrowserAsync(url)}
                            style={[
                              styles.saleRow,
                              i < arr.length - 1 && styles.saleRowBorder,
                            ]}
                          >
                            {imgUri ? (
                              <Image
                                source={{ uri: imgUri }}
                                style={styles.compThumbnail}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.compThumbnailPlaceholder}>
                                <Text style={{ color: "#444", fontSize: 16 }}>📷</Text>
                              </View>
                            )}

                            <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                              <Text
                                numberOfLines={2}
                                style={{ color: "#DDD", fontSize: 12, fontWeight: "500" }}
                              >
                                {item.title}
                              </Text>
                              <View style={styles.platformBadge}>
                                <Text style={styles.platformBadgeText}>eBay Active</Text>
                              </View>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={styles.salePrice}>${fmtNum(price)}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ color: "#666", fontSize: 13 }}>No eBay active listings found for this grade.</Text>
                      </View>
                    )
                  )}

                  {compsSourceTab === "myslabs_sold" && (
                    sortedMyslabsSales.length > 0 ? (
                      sortedMyslabsSales.slice(0, salesVisibleCount).map((sale: any, i: number, arr: any[]) => {
                        const price = getCompPrice(sale);
                        const imgUri = getCompImage(sale);
                        const dateStr = safeFormatDate(sale.endDate ?? sale.sold_date);
                        const url = getListingUrl(sale);

                        return (
                          <TouchableOpacity
                            key={sale.itemId || sale.id || i}
                            activeOpacity={0.7}
                            onPress={() => url && WebBrowser.openBrowserAsync(url)}
                            style={[
                              styles.saleRow,
                              i < arr.length - 1 && styles.saleRowBorder,
                            ]}
                          >
                            {imgUri ? (
                              <Image
                                source={{ uri: imgUri }}
                                style={styles.compThumbnail}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.compThumbnailPlaceholder}>
                                <Text style={{ color: "#444", fontSize: 16 }}>📷</Text>
                              </View>
                            )}

                            <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                              <Text
                                numberOfLines={2}
                                style={{ color: "#DDD", fontSize: 12, fontWeight: "500" }}
                              >
                                {sale.title}
                              </Text>
                              <View style={[styles.platformBadge, { backgroundColor: "#0057FF" }]}>
                                <Text style={[styles.platformBadgeText, { color: "#FFF" }]}>MySlabs</Text>
                              </View>
                              <Text style={styles.saleDate}>{dateStr}</Text>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={styles.salePrice}>${fmtNum(price)}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ color: "#666", fontSize: 13 }}>No MySlabs sold comps found for this grade.</Text>
                      </View>
                    )
                  )}

                  {compsSourceTab === "myslabs_active" && (
                    sortedMyslabsActive.length > 0 ? (
                      sortedMyslabsActive.slice(0, activeVisibleCount).map((item: any, i: number, arr: any[]) => {
                        const price = getCompPrice(item);
                        const imgUri = getCompImage(item);
                        const url = getListingUrl(item);

                        return (
                          <TouchableOpacity
                            key={item.itemId || item.id || i}
                            activeOpacity={0.7}
                            onPress={() => url && WebBrowser.openBrowserAsync(url)}
                            style={[
                              styles.saleRow,
                              i < arr.length - 1 && styles.saleRowBorder,
                            ]}
                          >
                            {imgUri ? (
                              <Image
                                source={{ uri: imgUri }}
                                style={styles.compThumbnail}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.compThumbnailPlaceholder}>
                                <Text style={{ color: "#444", fontSize: 16 }}>📷</Text>
                              </View>
                            )}

                            <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                              <Text
                                numberOfLines={2}
                                style={{ color: "#DDD", fontSize: 12, fontWeight: "500" }}
                              >
                                {item.title}
                              </Text>
                              <View style={[styles.platformBadge, { backgroundColor: "#0057FF" }]}>
                                <Text style={[styles.platformBadgeText, { color: "#FFF" }]}>MySlabs Active</Text>
                              </View>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={styles.salePrice}>${fmtNum(price)}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ color: "#666", fontSize: 13 }}>No MySlabs active listings found for this grade.</Text>
                      </View>
                    )
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => {
            useDealTabStore.getState().addTab({
              type: "sell",
              step: 3,
              cardData: card,
              cardId: card.card_id || card.id,
              variantId: card.variant_id,
              playerId: card.player_id,
              avgComp: parseFloat(card.current_market_value || card.currentMarketValue || "0"),
              capturedPhoto: card.photos?.[0],
              isExisting: true,
            });
            router.push("/sell/price");
          }}
        >
          <Text style={styles.sellBtnText}>Quick Sale</Text>
        </TouchableOpacity>
      </View>

      {/* Image Edit Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setShowImageModal(false)}
        >
          <Pressable style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Update Card Photo</Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <Ionicons name="close" size={22} color="#AAA" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handlePickGalleryImage}
              disabled={isUpdatingImage}
              style={modalStyles.actionBtn}
            >
              <Ionicons name="images-outline" size={18} color="#FFF" />
              <Text style={modalStyles.actionBtnText}>Pick Photo from Device Gallery</Text>
            </TouchableOpacity>

            <Text style={modalStyles.orText}>OR PASTE DIRECT WEB URL</Text>

            <TextInput
              style={modalStyles.input}
              placeholder="https://example.com/photo.jpg"
              placeholderTextColor="#555"
              value={imageUrlInput}
              onChangeText={setImageUrlInput}
              autoCapitalize="none"
            />

            <View style={modalStyles.btnRow}>
              <TouchableOpacity
                onPress={() => setShowImageModal(false)}
                style={modalStyles.cancelBtn}
              >
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveImageUrl}
                disabled={isUpdatingImage || !imageUrlInput.trim()}
                style={[modalStyles.saveBtn, { opacity: isUpdatingImage || !imageUrlInput.trim() ? 0.5 : 1 }]}
              >
                <Text style={modalStyles.saveBtnText}>
                  {isUpdatingImage ? "Saving..." : "Save Image"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Grade Edit Modal */}
      <Modal
        visible={showGradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGradeModal(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setShowGradeModal(false)}
        >
          <Pressable style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Edit Grade &amp; Company</Text>
              <TouchableOpacity onPress={() => setShowGradeModal(false)}>
                <Ionicons name="close" size={22} color="#AAA" />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>GRADING COMPANY</Text>
            <View style={modalStyles.chipContainer}>
              {["PSA", "BGS", "SGC", "CGC", "RAW"].map((co) => (
                <TouchableOpacity
                  key={co}
                  onPress={() => setEditCompany(co)}
                  style={[
                    modalStyles.chip,
                    editCompany === co && modalStyles.chipSelected,
                  ]}
                >
                  <Text style={[modalStyles.chipText, editCompany === co && modalStyles.chipTextSelected]}>
                    {co}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {editCompany !== "RAW" && (
              <>
                <Text style={[modalStyles.label, { marginTop: 16 }]}>GRADE VALUE</Text>
                <View style={modalStyles.chipContainer}>
                  {["10", "9.5", "9", "8.5", "8", "7", "6", "5"].map((gv) => (
                    <TouchableOpacity
                      key={gv}
                      onPress={() => setEditValue(gv)}
                      style={[
                        modalStyles.chip,
                        editValue === gv && modalStyles.chipSelected,
                      ]}
                    >
                      <Text style={[modalStyles.chipText, editValue === gv && modalStyles.chipTextSelected]}>
                        {gv}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={[modalStyles.btnRow, { marginTop: 24 }]}>
              <TouchableOpacity
                onPress={() => setShowGradeModal(false)}
                style={modalStyles.cancelBtn}
              >
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveGrade}
                disabled={isUpdatingGrade}
                style={[modalStyles.saveBtn, { backgroundColor: "#FFB300" }]}
              >
                <Text style={[modalStyles.saveBtnText, { color: "#000" }]}>
                  {isUpdatingGrade ? "Saving..." : "Save Grade"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Metrics (Cost Basis & Target Price) Edit Modal */}
      <Modal
        visible={showMetricsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMetricsModal(false)}
      >
        <Pressable
          style={modalStyles.overlay}
          onPress={() => setShowMetricsModal(false)}
        >
          <Pressable style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Edit Cost &amp; Target Price</Text>
              <TouchableOpacity onPress={() => setShowMetricsModal(false)}>
                <Ionicons name="close" size={22} color="#AAA" />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>COST BASIS ($)</Text>
            <TextInput
              style={modalStyles.input}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#555"
              value={editCostBasis}
              onChangeText={setEditCostBasis}
            />

            <Text style={[modalStyles.label, { marginTop: 14 }]}>YOUR TARGET PRICE ($)</Text>
            <TextInput
              style={modalStyles.input}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#555"
              value={editTargetPrice}
              onChangeText={setEditTargetPrice}
            />

            <View style={[modalStyles.btnRow, { marginTop: 24 }]}>
              <TouchableOpacity
                onPress={() => setShowMetricsModal(false)}
                style={modalStyles.cancelBtn}
              >
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveMetrics}
                disabled={isUpdatingMetrics}
                style={modalStyles.saveBtn}
              >
                <Text style={modalStyles.saveBtnText}>
                  {isUpdatingMetrics ? "Updating..." : "Save Prices"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <CustomAlertModal
        visible={showDeleteConfirm}
        title="Delete Card"
        message={`Are you sure you want to delete "${card?.player_name || "this card"}" from your inventory? Comps and player info will remain saved.`}
        confirmText="Delete Card"
        cancelText="Cancel"
        iconName="trash-outline"
        variant="danger"
        onConfirm={async () => {
          try {
            await inventoryService.deleteItem(id ?? "");
            await queryClient.invalidateQueries();
            setShowDeleteConfirm(false);
            router.back();
          } catch (err: any) {
            console.error(err);
            setShowDeleteConfirm(false);
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#111111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  label: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  actionBtn: {
    backgroundColor: "#0057FF",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  orText: {
    color: "#555555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
    marginVertical: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  chipSelected: {
    backgroundColor: "#0057FF",
    borderColor: "#0057FF",
  },
  chipText: {
    color: "#AAA",
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextSelected: {
    color: "#FFF",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#0057FF",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 54,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#FFFFFF", fontSize: 24, lineHeight: 28 },
  headerTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },

  imageArea: {
    height: 280,
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  imageInitials: { color: "#333333", fontSize: 64, fontWeight: "900" },
  certBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  certText: { color: "#AAAAAA", fontSize: 11, fontWeight: "600" },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editImageBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    zIndex: 10,
  },
  editImageBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  editGradeBtn: {
    padding: 6,
    backgroundColor: "#111111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  playerName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  cardSubtitle: { color: "#AAAAAA", fontSize: 14, textAlign: "center" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCell: {
    width: "48%",
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: { fontSize: 18, fontWeight: "800" },

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
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  detailLabel: { color: "#888888", fontSize: 13 },
  detailValue: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

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
