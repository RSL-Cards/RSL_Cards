import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { Surface } from "../../src/components/ui/Surface";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

import { useActiveDailyLog } from "../../src/hooks/useDashboard";
import { useInventory, QUERY_KEYS } from "../../src/hooks/useCardScan";
import { cardService, type EbaySoldItem } from "../../src/services/cardService";
import { getGradeConfig } from "../(tabs)/inventory";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../src/stores/authStore";
import { ActiveLogIndicator } from "../../src/components/ActiveLogIndicator";
import { apiClient } from "../../src/lib/apiClient";
import NetInfo from "@react-native-community/netinfo";
import { useSyncStore } from "../../src/stores/syncStore";

function calcMedian(items: any[]): number {
  if (!items.length) return 0;
  const prices = items
    .map((i) => parseFloat(i.soldPrice?.value ?? i.price?.value ?? i.price ?? "0"))
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return 0;
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
}

interface ReceivedCardConfig {
  id: string;
  query: string;
  playerName: string;
  costBasis: string;
  targetPrice: string;
  medianComp: number;
  ebaySalesCount: number;
  myslabsSalesCount: number;
  activeCount: number;
  isFetching: boolean;
  gradeCompany: string;
  gradeValue: string;
  gradeKey: string;
}

const PAYMENT_METHODS = [
  { id: "trade", label: "Trade" },
  { id: "cash", label: "Cash" },
  { id: "zelle", label: "Zelle" },
  { id: "venmo", label: "Venmo" },
  { id: "paypal", label: "PayPal" },
  { id: "credit_card", label: "Card" },
];

const CHANNELS = [
  { id: "card_show", label: "Card Show" },
  { id: "shop", label: "Shop" },
  { id: "online", label: "Online" },
  { id: "local_deal", label: "Local Deal" },
  { id: "other", label: "Other" },
];

export default function TradeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? "");
  const { data: activeLog } = useActiveDailyLog();

  // Load available inventory
  const { data: inventoryData, isLoading: isLoadingInventory } = useInventory({
    status: "unlisted",
    limit: 100,
  });

  const availableInventory = inventoryData?.items ?? [];

  // Step 1 State: Cards Given
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2 State: Cards Received External API Search
  const [receivedInputQuery, setReceivedInputQuery] = useState("");
  const [receivedCards, setReceivedCards] = useState<ReceivedCardConfig[]>([]);
  const [isFetchingComps, setIsFetchingComps] = useState(false);

  // Step 3 State: Payment & Channel
  const [cashDifference, setCashDifference] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("trade");
  const [selectedChannel, setSelectedChannel] = useState("card_show");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter inventory by search query
  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return availableInventory;
    const q = searchQuery.toLowerCase();
    return availableInventory.filter(
      (item: any) =>
        (item.player_name || "").toLowerCase().includes(q) ||
        (item.set_name || "").toLowerCase().includes(q) ||
        (item.year ? String(item.year) : "").includes(q)
    );
  }, [availableInventory, searchQuery]);

  // Selected inventory items details
  const selectedItems = useMemo(() => {
    return availableInventory.filter((item: any) =>
      selectedInventoryIds.includes(item.id)
    );
  }, [availableInventory, selectedInventoryIds]);

  const totalGivenValue = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + parseFloat(item.current_market_value || "0"),
      0
    );
  }, [selectedItems]);

  const toggleSelectCard = (id: string) => {
    setSelectedInventoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Fetch Comps via eBay & MySlabs external APIs for entered queries
  const handleFetchCompsForReceived = async () => {
    const rawQueries = receivedInputQuery
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean);

    if (!rawQueries.length) {
      Alert.alert("Input Search Query", "Please enter card names separated by commas (e.g. 2024 Topps Chrome Lamine Yamal PSA 10).");
      return;
    }

    setIsFetchingComps(true);

    try {
      const results: ReceivedCardConfig[] = await Promise.all(
        rawQueries.map(async (queryStr, index) => {
          let median = 0;
          let ebaySalesCount = 0;
          let myslabsSalesCount = 0;
          let activeCount = 0;
          let player = queryStr;

          // Detect grade from query if present
          let company = "PSA";
          let value = "10";
          let key = "PSA_10";

          if (/\braw\b/i.test(queryStr)) {
            company = "RAW";
            value = "RAW";
            key = "RAW";
          } else {
            const gradeMatch = queryStr.match(/\b(PSA|BGS|SGC|CGC)\b\s*(\d+(?:\.\d+)?)/i);
            if (gradeMatch) {
              company = gradeMatch[1].toUpperCase();
              value = gradeMatch[2];
              key = `${company}_${value.replace(".", "")}`;
            }
          }

          try {
            const [ebayRes, myslabsRes] = await Promise.allSettled([
              cardService.getEbaySold(queryStr, 10),
              cardService.getMyslabsSold(queryStr, 10),
            ]);

            const ebayData = ebayRes.status === "fulfilled" ? ebayRes.value : null;
            const myslabsData = myslabsRes.status === "fulfilled" ? myslabsRes.value : null;

            const ebaySold = ebayData?.sold30d?.items || [];
            const myslabsSold = myslabsData?.sold30d?.items || [];
            const ebayActive = ebayData?.activeListings || [];
            const myslabsActive = myslabsData?.activeListings || [];

            const allSold = [...ebaySold, ...myslabsSold];
            median = calcMedian(allSold);

            ebaySalesCount = ebaySold.length;
            myslabsSalesCount = myslabsSold.length;
            activeCount = ebayActive.length + myslabsActive.length;
          } catch (e) {
            console.warn("Comps lookup error for query:", queryStr, e);
          }

          return {
            id: `rcv-${index}-${Date.now()}`,
            query: queryStr,
            playerName: player,
            costBasis: "0",
            targetPrice: median > 0 ? String(median.toFixed(2)) : "0",
            medianComp: median,
            ebaySalesCount,
            myslabsSalesCount,
            activeCount,
            isFetching: false,
            gradeCompany: company,
            gradeValue: value,
            gradeKey: key,
          };
        })
      );

      setReceivedCards(results);
    } catch (err: any) {
      Alert.alert("Comps Error", err.message || "Failed to fetch external comps.");
    } finally {
      setIsFetchingComps(false);
    }
  };

  const updateReceivedCard = (id: string, field: keyof ReceivedCardConfig, value: any) => {
    setReceivedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = () => {
    if (selectedInventoryIds.length === 0) {
      Alert.alert("Cards Given Required", "Please select at least 1 card from your inventory to give in trade.");
      return;
    }

    if (receivedCards.length === 0) {
      Alert.alert("Cards Received Required", "Please enter cards received and tap 'Fetch External Comps' to load card details.");
      return;
    }

    if (!activeLog) {
      Alert.alert(
        "No Active Daily Log",
        "You are about to record this trade outside of an active daily log. Would you like to proceed or open a daily log first?",
        [
          { text: "Open Daily Log", onPress: () => router.push("/(tabs)/") },
          { text: "Proceed Anyway", onPress: () => processSubmit() },
        ]
      );
    } else {
      processSubmit();
    }
  };

  const processSubmit = async () => {
    setIsSubmitting(true);

    const price = parseFloat(cashDifference) || 0;

    // Build cardsGiven payload from selected inventory items
    const cardsGivenPayload = selectedItems.map((item: any) => ({
      inventoryId: item.id,
      playerName: item.player_name,
      gradeKey: item.grade_key || "RAW",
      marketValue: parseFloat(item.current_market_value || "0"),
    }));

    // Build cardsReceived payload from external API comps cards
    const cardsReceivedPayload = receivedCards.map((card) => ({
      playerName: card.playerName || card.query,
      gradeKey: card.gradeKey || "RAW",
      gradeCompany: card.gradeCompany || "PSA",
      gradeValue: card.gradeValue || "10",
      costBasis: parseFloat(card.costBasis) || 0,
      marketValue: parseFloat(card.targetPrice) || card.medianComp || 0,
      year: new Date().getFullYear(),
      setName: "Trade",
      variation: "Base",
      cardNumber: "N/A",
      sport: "other",
    }));

    const payload = {
      price,
      paymentMethod: selectedPaymentMethod,
      channel: selectedChannel,
      dailyLogId: activeLog?.id || null,
      cardsGiven: cardsGivenPayload,
      cardsReceived: cardsReceivedPayload,
    };

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        useSyncStore.getState().addPendingTransaction("trade", payload);
        Alert.alert("Saved Offline", "Pending Sync — trade transaction will sync when online.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      await apiClient.post("/v1/transactions/trade", payload);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory(userId) });

      Alert.alert("Trade Recorded", `Trade recorded successfully! ${selectedItems.length} card(s) given, ${receivedCards.length} card(s) received.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to record trade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Button label="Back" variant="outline" onPress={() => router.back()} size="sm" />
        <Typography variant="h2" weight="800">Record Trade</Typography>
        <View style={{ width: 60 }} />
      </View>

      <ActiveLogIndicator />

      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 140 }}>
        {/* SECTION 1: CARDS GIVEN */}
        <View style={{ marginBottom: SPACING.xs }}>
          <Typography variant="label" color={COLORS.zinc400} style={{ letterSpacing: 1, marginBottom: 6 }}>
            1. CARDS GIVEN (SELECT FROM INVENTORY)
          </Typography>

          {selectedInventoryIds.length > 0 && (
            <View style={styles.selectedPillBar}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="card-outline" size={15} color="#0057FF" />
                <Typography variant="caption" weight="700" color={COLORS.zinc300}>
                  Total Value: <Typography variant="caption" weight="800" color="#00C853">${totalGivenValue.toFixed(2)}</Typography>
                </Typography>
              </View>
              <View style={styles.selectedPillBadge}>
                <Typography variant="caption" weight="800" color="#FFFFFF" style={{ fontSize: 11 }}>
                  {selectedInventoryIds.length} {selectedInventoryIds.length === 1 ? "Card" : "Cards"} Selected
                </Typography>
              </View>
            </View>
          )}
        </View>

        {/* Search Inventory Input */}
        <Surface variant="elevated" padding="none" style={{ marginBottom: SPACING.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.md }}>
            <Ionicons name="search-outline" size={16} color={COLORS.zinc500} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Search inventory by player or set..."
              placeholderTextColor={COLORS.zinc500}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color={COLORS.zinc500} />
              </TouchableOpacity>
            )}
          </View>
        </Surface>

        {/* Inventory Cards List */}
        <Surface variant="elevated" padding="none" style={styles.inventoryContainer}>
          {isLoadingInventory ? (
            <View style={{ padding: SPACING.xl, alignItems: "center" }}>
              <ActivityIndicator color="#0057FF" />
            </View>
          ) : filteredInventory.length === 0 ? (
            <View style={{ padding: SPACING.xl, alignItems: "center" }}>
              <Typography variant="caption" color={COLORS.zinc500}>
                {searchQuery ? "No matching inventory cards found." : "No available unlisted inventory cards found."}
              </Typography>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled showsVerticalScrollIndicator>
              {filteredInventory.map((item: any) => {
                const isSelected = selectedInventoryIds.includes(item.id);
                const gradeCfg = getGradeConfig(item.grade_key, item);
                const mktVal = parseFloat(item.current_market_value || "0");

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => toggleSelectCard(item.id)}
                    style={[
                      styles.inventoryRow,
                      isSelected && styles.inventoryRowSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>

                    <View style={styles.thumb}>
                      {item.photos?.[0] ? (
                        <Image source={{ uri: item.photos[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      ) : (
                        <Typography variant="caption" weight="800" color={COLORS.zinc500}>
                          {(item.player_name ?? "?").slice(0, 2).toUpperCase()}
                        </Typography>
                      )}
                    </View>

                    <View style={{ flex: 1, marginLeft: SPACING.sm, paddingRight: SPACING.xs }}>
                      <Typography variant="body" weight="700" numberOfLines={1}>
                        {item.player_name}
                      </Typography>
                      <Typography variant="caption" color={COLORS.zinc500} numberOfLines={1}>
                        {[item.year, item.set_name, item.variation !== "Base" ? item.variation : null].filter(Boolean).join(" · ")}
                      </Typography>
                    </View>

                    <View style={{ alignItems: "flex-end", justifyContent: "center", minWidth: 64, gap: 3 }}>
                      <View style={[styles.gradeBadge, { backgroundColor: gradeCfg.bg }]}>
                        <Typography variant="label" color={gradeCfg.color} style={{ fontSize: 9, fontWeight: "800" }}>
                          {gradeCfg.label}
                        </Typography>
                      </View>
                      <Typography variant="caption" weight="700" color={COLORS.white}>
                        ${mktVal.toFixed(2)}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Surface>

        {/* SECTION 2: CARDS RECEIVED (EXTERNAL API COMPS) */}
        <Typography variant="label" color={COLORS.zinc400} style={{ marginTop: SPACING.xl, marginBottom: SPACING.xs, letterSpacing: 1 }}>
          2. CARDS RECEIVED (EXTERNAL COMPS SEARCH)
        </Typography>

        <Surface variant="elevated" padding="none">
          <View style={{ padding: SPACING.sm }}>
            <TextInput
              style={[styles.input, { minHeight: 64, textAlignVertical: "top" }]}
              multiline
              placeholder="e.g. 2024 Topps Chrome Lamine Yamal PSA 10, 2020 Donruss Patrick Mahomes PSA 10"
              placeholderTextColor={COLORS.zinc500}
              value={receivedInputQuery}
              onChangeText={setReceivedInputQuery}
            />

            <TouchableOpacity
              onPress={handleFetchCompsForReceived}
              disabled={isFetchingComps || !receivedInputQuery.trim()}
              style={[styles.fetchCompsBtn, { opacity: isFetchingComps || !receivedInputQuery.trim() ? 0.5 : 1 }]}
            >
              {isFetchingComps ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="search" size={16} color="#FFF" />
                  <Typography variant="caption" weight="700" color="#FFF" style={{ fontSize: 13 }}>
                    Fetch External Comps (eBay &amp; MySlabs)
                  </Typography>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Parsed Received Cards Data Cards */}
        {receivedCards.length > 0 && (
          <View style={{ marginTop: SPACING.md, gap: 12 }}>
            {receivedCards.map((card, idx) => (
              <Surface key={card.id} variant="elevated" padding="md" style={styles.receivedCardBox}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Typography variant="body" weight="800" color="#FFF" style={{ flex: 1 }}>
                    Card #{idx + 1}: {card.query}
                  </Typography>
                  <View style={styles.gradeBadge}>
                    <Typography variant="caption" weight="800" color="#FFD700">
                      {card.gradeKey.replace("_", " ")}
                    </Typography>
                  </View>
                </View>

                {/* Comps Summary Badge */}
                <View style={styles.compsSummaryRow}>
                  <View style={styles.compPill}>
                    <Ionicons name="stats-chart" size={12} color="#0057FF" />
                    <Typography variant="caption" weight="700" color="#0057FF">
                      Median Comp: {card.medianComp > 0 ? `$${card.medianComp.toFixed(2)}` : "N/A"}
                    </Typography>
                  </View>

                  <Typography variant="caption" color={COLORS.zinc500}>
                    {card.ebaySalesCount} eBay · {card.myslabsSalesCount} MySlabs Sales
                  </Typography>
                </View>

                {/* Price Inputs: Cost Basis & Target Price */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="label" color={COLORS.zinc500} style={{ fontSize: 10, marginBottom: 4 }}>
                      COST BASIS ($)
                    </Typography>
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#555"
                      value={card.costBasis}
                      onChangeText={(v) => updateReceivedCard(card.id, "costBasis", v)}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Typography variant="label" color={COLORS.zinc500} style={{ fontSize: 10, marginBottom: 4 }}>
                      TARGET MARKET ($)
                    </Typography>
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#555"
                      value={card.targetPrice}
                      onChangeText={(v) => updateReceivedCard(card.id, "targetPrice", v)}
                    />
                  </View>
                </View>
              </Surface>
            ))}
          </View>
        )}

        {/* SECTION 3: TRANSACTION DETAILS */}
        <Typography variant="label" color={COLORS.zinc400} style={{ marginTop: SPACING.xl, marginBottom: SPACING.xs, letterSpacing: 1 }}>
          3. CASH DIFFERENCE ($)
        </Typography>
        <Surface variant="elevated" padding="none">
          <TextInput
            style={styles.input}
            placeholder="e.g. 50 (Cash Paid Out) or -50 (Cash Received)"
            placeholderTextColor={COLORS.zinc500}
            keyboardType="numbers-and-punctuation"
            value={cashDifference}
            onChangeText={setCashDifference}
          />
        </Surface>

        {/* Payment Method Selector */}
        <Typography variant="label" color={COLORS.zinc400} style={{ marginTop: SPACING.xl, marginBottom: SPACING.xs, letterSpacing: 1 }}>
          PAYMENT METHOD
        </Typography>
        <View style={styles.chipRow}>
          {PAYMENT_METHODS.map((pm) => {
            const isSelected = selectedPaymentMethod === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setSelectedPaymentMethod(pm.id)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Typography variant="caption" weight="700" color={isSelected ? "#FFF" : COLORS.zinc400}>
                  {pm.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Where You Buy / Trade Channel Selector */}
        <Typography variant="label" color={COLORS.zinc400} style={{ marginTop: SPACING.xl, marginBottom: SPACING.xs, letterSpacing: 1 }}>
          WHERE DID YOU TRADE? (CHANNEL)
        </Typography>
        <View style={styles.chipRow}>
          {CHANNELS.map((ch) => {
            const isSelected = selectedChannel === ch.id;
            return (
              <TouchableOpacity
                key={ch.id}
                onPress={() => setSelectedChannel(ch.id)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Typography variant="caption" weight="700" color={isSelected ? "#FFF" : COLORS.zinc400}>
                  {ch.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SUBMIT BUTTON */}
        <Button
          label={isSubmitting ? "Processing Trade..." : "Record Trade"}
          onPress={handleSubmit}
          variant="primary"
          style={{ marginTop: SPACING.xxl }}
          disabled={isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  input: {
    color: COLORS.white,
    padding: SPACING.md,
    fontSize: 15,
  },
  priceInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "700",
  },
  selectedPillBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,87,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0,87,255,0.3)",
    marginBottom: 8,
  },
  selectedPillBadge: {
    backgroundColor: "#0057FF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  inventoryContainer: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inventoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.zinc900,
  },
  inventoryRowSelected: {
    backgroundColor: "rgba(0, 87, 255, 0.15)",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.zinc600,
    marginRight: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#0057FF",
    borderColor: "#0057FF",
  },
  thumb: {
    width: 32,
    height: 44,
    borderRadius: 4,
    backgroundColor: COLORS.zinc800,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradeBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#1A1A1A",
  },
  fetchCompsBtn: {
    backgroundColor: "#0057FF",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  fetchCompsBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  receivedCardBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    backgroundColor: "#111111",
  },
  compsSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  compPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,87,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipRow: {
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
});
