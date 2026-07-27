import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { Surface } from "../../src/components/ui/Surface";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

import { useActiveDailyLog } from "../../src/hooks/useDashboard";
import { useInventory, QUERY_KEYS } from "../../src/hooks/useCardScan";
import { cardService } from "../../src/services/cardService";
import { getGradeConfig } from "../(tabs)/inventory";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../src/stores/authStore";
import { ActiveLogIndicator } from "../../src/components/ActiveLogIndicator";
import { apiClient } from "../../src/lib/apiClient";
import NetInfo from "@react-native-community/netinfo";
import { useSyncStore } from "../../src/stores/syncStore";
import Toast from "react-native-toast-message";

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
  photoUri?: string;
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
  year?: number;
  setName?: string;
  variation?: string;
  cardNumber?: string;
  certNumber?: string;
  autoGrade?: string;
  sport?: string;
  cardId?: string;
  variantId?: string;
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

const GRADE_COMPANIES = ["PSA", "BGS", "SGC", "CGC", "RAW"];

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

  // Step 2 State: Cards Received External API Search & AI Camera Scan
  const [receivedCards, setReceivedCards] = useState<ReceivedCardConfig[]>([]);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);

  // Scanned Card Review Modal State
  const [scannedModalData, setScannedModalData] = useState<{
    photoUri: string;
    base64Data?: string;
    playerName: string;
    year: string;
    setName: string;
    variation: string;
    cardNumber: string;
    certNumber: string;
    autoGrade: string;
    gradeCompany: string;
    gradeValue: string;
    sport: string;
    cardId?: string;
    variantId?: string;
  } | null>(null);

  const [isConfirmingScannedCard, setIsConfirmingScannedCard] = useState(false);

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

  const processCapturedPhoto = async (rawPhotoUri: string) => {
    setIsScanningPhoto(true);
    try {
      // Compress and resize image using ImageManipulator for fast AI scanning & low memory
      const manipResult = await ImageManipulator.manipulateAsync(
        rawPhotoUri,
        [{ resize: { width: 800 } }],
        { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const photoUri = manipResult.uri;
      let base64Data = manipResult.base64;

      if (!base64Data) {
        base64Data = await FileSystem.readAsStringAsync(photoUri, {
          encoding: "base64",
        });
      }

      // Run RSL Vision AI Scan
      const scanRes = await cardService.scanImage(base64Data);
      const scanned = scanRes.card;

      setScannedModalData({
        photoUri,
        base64Data,
        playerName: scanned.player_name || "",
        year: String(scanned.year || new Date().getFullYear()),
        setName: scanned.set_name || "",
        variation: scanned.variation || (scanned as any).subset || "",
        cardNumber: scanned.card_number || "",
        certNumber: scanned.grading?.cert_number || "",
        autoGrade: (scanned.grading as any)?.auto_grade || "",
        gradeCompany: scanned.grading?.company || "PSA",
        gradeValue: scanned.grading?.grade || "10",
        sport: scanned.sport || "football",
        cardId: scanRes.cardId,
        variantId: scanRes.variantId,
      });

      Toast.show({
        type: "success",
        text1: "Card Extracted by RSL Vision!",
        text2: "Review & edit card details before fetching comps.",
      });
    } catch (err: any) {
      Alert.alert("Scan Failed", err.message || "Could not identify card. Try again.");
    } finally {
      setIsScanningPhoto(false);
    }
  };

  // Check pending picker results if Android Activity was destroyed during camera/gallery capture
  useEffect(() => {
    ImagePicker.getPendingResultAsync()
      .then((res: any) => {
        if (!res) return;
        const list = Array.isArray(res) ? res : [res];
        for (const item of list) {
          if (!item.canceled && item.assets?.[0]?.uri) {
            processCapturedPhoto(item.assets[0].uri);
            break;
          }
        }
      })
      .catch(() => {});
  }, []);

  // AI Vision Camera Scan & Gallery Upload for Cards Received
  const handleScanCardReceived = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", `Please allow ${useCamera ? "camera" : "photo library"} access to scan cards.`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.4,
            mediaTypes: "images",
            allowsEditing: false,
            exif: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.4,
            mediaTypes: "images",
            allowsEditing: false,
            exif: false,
          });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await processCapturedPhoto(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert("Scan Failed", err.message || "Could not launch camera/gallery.");
    }
  };

  // Submit Scanned Card Review Modal & Fetch Comps
  const handleConfirmScannedModal = async () => {
    if (!scannedModalData) return;
    setIsConfirmingScannedCard(true);

    const {
      photoUri,
      playerName,
      year,
      setName,
      variation,
      cardNumber,
      certNumber,
      autoGrade,
      gradeCompany,
      gradeValue,
      sport,
      cardId,
      variantId,
    } = scannedModalData;

    const company = (gradeCompany || "PSA").toUpperCase().trim();
    const val = (gradeValue || "10").trim();
    const gradeKey = company === "RAW" || val === "RAW" ? "RAW" : `${company}_${val.replace(".", "")}`;

    const parsedYear = parseInt(year, 10) || new Date().getFullYear();
    const buildQuery = [
      playerName,
      parsedYear,
      setName,
      variation && variation !== "Base" ? variation : null,
      cardNumber ? `#${cardNumber}` : null,
      company !== "RAW" ? `${company} ${val}` : "RAW",
    ]
      .filter(Boolean)
      .join(" ");

    let median = 0;
    let ebaySalesCount = 0;
    let myslabsSalesCount = 0;
    let activeCount = 0;

    try {
      const [ebayRes, myslabsRes] = await Promise.allSettled([
        cardService.getEbaySold(buildQuery, 10, variantId, gradeKey),
        cardService.getMyslabsSold(buildQuery, 10),
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
      console.warn("Comps lookup error for confirmed card", e);
    }

    const newCard: ReceivedCardConfig = {
      id: `rcv-${Date.now()}`,
      query: buildQuery,
      playerName: playerName || "Card",
      photoUri,
      costBasis: "0",
      targetPrice: median > 0 ? String(median.toFixed(2)) : "0",
      medianComp: median,
      ebaySalesCount,
      myslabsSalesCount,
      activeCount,
      isFetching: false,
      gradeCompany: company,
      gradeValue: val,
      gradeKey,
      year: parsedYear,
      setName,
      variation,
      cardNumber,
      certNumber,
      autoGrade,
      sport,
      cardId,
      variantId,
    };

    setReceivedCards((prev) => [...prev, newCard]);
    setScannedModalData(null);
    setIsConfirmingScannedCard(false);
    Toast.show({
      type: "success",
      text1: "Card Added to Received List!",
      text2: `${playerName} (${gradeKey.replace("_", " ")}) — Median $${median.toFixed(2)}`,
    });
  };

  const updateReceivedCard = (id: string, field: keyof ReceivedCardConfig, value: any) => {
    setReceivedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeReceivedCard = (id: string) => {
    setReceivedCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = () => {
    if (selectedInventoryIds.length === 0) {
      Alert.alert("Cards Given Required", "Please select at least 1 card from your inventory to give in trade.");
      return;
    }

    if (receivedCards.length === 0) {
      Alert.alert("Cards Received Required", "Please scan a card photo to add cards received.");
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
      year: card.year || new Date().getFullYear(),
      setName: card.setName || "Trade",
      variation: card.variation || "Base",
      cardNumber: card.cardNumber || "N/A",
      certNumber: card.certNumber || null,
      autoGrade: card.autoGrade || null,
      sport: card.sport || "football",
      cardId: card.cardId,
      variantId: card.variantId,
      photos: card.photoUri ? [card.photoUri] : undefined,
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

      Alert.alert("Trade Recorded", `Trade recorded successfully! ${selectedItems.length} card(s) given, ${receivedCards.length} card(s) received and stored in Inventory.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to record trade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Button label="Back" variant="outline" onPress={() => router.back()} size="sm" />
        <Typography variant="h2" weight="800">Record Trade</Typography>
        <View style={{ width: 60 }} />
      </View>

      <ActiveLogIndicator />

      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
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

        {/* SECTION 2: CARDS RECEIVED (SCAN PHOTO OR UPLOAD) */}
        <Typography variant="label" color={COLORS.zinc400} style={{ marginTop: SPACING.xl, marginBottom: SPACING.xs, letterSpacing: 1 }}>
          2. CARDS RECEIVED (SCAN PHOTO OR UPLOAD)
        </Typography>

        {/* Scan / Upload Action Bar */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => handleScanCardReceived(true)}
            disabled={isScanningPhoto}
            style={[styles.scanActionBtn, { backgroundColor: "#1A1A1A", borderColor: "#FFD700" }]}
          >
            <Ionicons name="camera-outline" size={18} color="#FFD700" />
            <Typography variant="caption" weight="700" color="#FFFFFF" style={{ fontSize: 12 }}>
              Scan Card (Camera)
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleScanCardReceived(false)}
            disabled={isScanningPhoto}
            style={[styles.scanActionBtn, { backgroundColor: "#1A1A1A", borderColor: "#0057FF" }]}
          >
            <Ionicons name="images-outline" size={18} color="#0057FF" />
            <Typography variant="caption" weight="700" color="#FFFFFF" style={{ fontSize: 12 }}>
              Upload Photo
            </Typography>
          </TouchableOpacity>
        </View>

        {isScanningPhoto && (
          <View style={styles.scanningBanner}>
            <ActivityIndicator size="small" color="#0057FF" />
            <Typography variant="caption" weight="700" color="#0057FF">
              RSL AI Vision scanning card image...
            </Typography>
          </View>
        )}

        {/* Parsed / Scanned Received Cards Cards */}
        {receivedCards.length > 0 && (
          <View style={{ marginTop: SPACING.md, gap: 12 }}>
            {receivedCards.map((card, idx) => (
              <Surface key={card.id} variant="elevated" padding="md" style={styles.receivedCardBox}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  {card.photoUri ? (
                    <Image source={{ uri: card.photoUri }} style={styles.receivedThumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.receivedThumbPlaceholder}>
                      <Ionicons name="card-outline" size={18} color={COLORS.zinc500} />
                    </View>
                  )}

                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Typography variant="body" weight="800" color="#FFF" numberOfLines={1}>
                      {card.playerName}
                    </Typography>
                    <Typography variant="caption" color={COLORS.zinc500} numberOfLines={1}>
                      {[card.year, card.setName, card.variation && card.variation !== "Base" ? card.variation : null, card.cardNumber ? `#${card.cardNumber}` : null].filter(Boolean).join(" · ")}
                    </Typography>
                    {card.certNumber ? (
                      <Typography variant="caption" color={COLORS.zinc400} style={{ fontSize: 10, marginTop: 1 }}>
                        Cert: {card.certNumber} {card.autoGrade ? `· Auto ${card.autoGrade}` : ""}
                      </Typography>
                    ) : null}
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <View style={styles.gradeBadge}>
                      <Typography variant="caption" weight="800" color="#FFD700">
                        {card.gradeKey.replace("_", " ")}
                      </Typography>
                    </View>

                    <TouchableOpacity onPress={() => removeReceivedCard(card.id)} style={{ padding: 2 }}>
                      <Ionicons name="trash-outline" size={16} color="#E8001C" />
                    </TouchableOpacity>
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

      {/* EDIT / REVIEW SCANNED CARD MODAL */}
      <Modal
        visible={!!scannedModalData}
        transparent
        animationType="slide"
        onRequestClose={() => setScannedModalData(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface variant="elevated" padding="lg" style={styles.modalContent}>
            {/* Modal Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
              <Typography variant="h3" weight="800" color="#FFF">
                Review Scanned Card
              </Typography>

              <TouchableOpacity onPress={() => setScannedModalData(null)} style={{ padding: 4 }}>
                <Ionicons name="close" size={20} color={COLORS.zinc400} />
              </TouchableOpacity>
            </View>

            <Typography variant="caption" color={COLORS.zinc500} style={{ marginBottom: SPACING.md }}>
              Verify or edit card & slab details extracted by RSL Vision before fetching sales comps.
            </Typography>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {/* Photo Preview Thumbnail */}
              {scannedModalData?.photoUri && (
                <View style={{ alignItems: "center", marginBottom: 4 }}>
                  <Image source={{ uri: scannedModalData.photoUri }} style={styles.modalThumb} resizeMode="contain" />
                </View>
              )}

              {/* Player Name */}
              <View>
                <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                  PLAYER NAME
                </Typography>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Patrick Mahomes II"
                  placeholderTextColor="#555"
                  value={scannedModalData?.playerName || ""}
                  onChangeText={(val) =>
                    setScannedModalData((prev) => (prev ? { ...prev, playerName: val } : prev))
                  }
                />
              </View>

              {/* Year & Card Number */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                    YEAR
                  </Typography>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    placeholder="2022"
                    placeholderTextColor="#555"
                    value={scannedModalData?.year || ""}
                    onChangeText={(val) =>
                      setScannedModalData((prev) => (prev ? { ...prev, year: val } : prev))
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                    CARD #
                  </Typography>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="DTPM"
                    placeholderTextColor="#555"
                    value={scannedModalData?.cardNumber || ""}
                    onChangeText={(val) =>
                      setScannedModalData((prev) => (prev ? { ...prev, cardNumber: val } : prev))
                    }
                  />
                </View>
              </View>

              {/* Set Name & Variation / Subset */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                    SET NAME
                  </Typography>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Panini Donruss"
                    placeholderTextColor="#555"
                    value={scannedModalData?.setName || ""}
                    onChangeText={(val) =>
                      setScannedModalData((prev) => (prev ? { ...prev, setName: val } : prev))
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                    VARIATION / SUBSET
                  </Typography>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Downtown!"
                    placeholderTextColor="#555"
                    value={scannedModalData?.variation || ""}
                    onChangeText={(val) =>
                      setScannedModalData((prev) => (prev ? { ...prev, variation: val } : prev))
                    }
                  />
                </View>
              </View>

              {/* Grading Company Selectable Buttons */}
              <View>
                <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 6 }}>
                  GRADING COMPANY
                </Typography>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {GRADE_COMPANIES.map((company) => {
                    const isSelected = scannedModalData?.gradeCompany === company;
                    return (
                      <TouchableOpacity
                        key={company}
                        onPress={() =>
                          setScannedModalData((prev) => (prev ? { ...prev, gradeCompany: company } : prev))
                        }
                        style={[styles.gradeChip, isSelected && styles.gradeChipSelected]}
                      >
                        <Typography variant="caption" weight="800" color={isSelected ? "#FFF" : COLORS.zinc400}>
                          {company}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Card Grade, Auto Grade & Slab Cert Number */}
              {scannedModalData?.gradeCompany !== "RAW" && (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                      CARD GRADE
                    </Typography>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="10, 9.5, 9"
                      placeholderTextColor="#555"
                      value={scannedModalData?.gradeValue || "10"}
                      onChangeText={(val) =>
                        setScannedModalData((prev) => (prev ? { ...prev, gradeValue: val } : prev))
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                      AUTO GRADE (OPTIONAL)
                    </Typography>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="10"
                      placeholderTextColor="#555"
                      value={scannedModalData?.autoGrade || ""}
                      onChangeText={(val) =>
                        setScannedModalData((prev) => (prev ? { ...prev, autoGrade: val } : prev))
                      }
                    />
                  </View>

                  <View style={{ flex: 1.5 }}>
                    <Typography variant="label" color={COLORS.zinc400} style={{ fontSize: 10, marginBottom: 4 }}>
                      SLAB CERT #
                    </Typography>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="93463931"
                      placeholderTextColor="#555"
                      value={scannedModalData?.certNumber || ""}
                      onChangeText={(val) =>
                        setScannedModalData((prev) => (prev ? { ...prev, certNumber: val } : prev))
                      }
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Submit & Fetch Comps Action Buttons */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: SPACING.lg }}>
              <Button
                label="Cancel"
                variant="outline"
                onPress={() => setScannedModalData(null)}
                style={{ flex: 1 }}
                disabled={isConfirmingScannedCard}
              />
              <Button
                label={isConfirmingScannedCard ? "Fetching Comps..." : "Confirm & Fetch Comps"}
                variant="primary"
                onPress={handleConfirmScannedModal}
                style={{ flex: 2 }}
                disabled={isConfirmingScannedCard}
              />
            </View>
          </Surface>
        </View>
      </Modal>
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
  scanActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  scanningBanner: {
    padding: 12,
    backgroundColor: "rgba(0,87,255,0.12)",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,87,255,0.3)",
  },
  receivedCardBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    backgroundColor: "#111111",
  },
  receivedThumb: {
    width: 38,
    height: 52,
    borderRadius: 6,
    marginRight: 10,
  },
  receivedThumbPlaceholder: {
    width: 38,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  modalContent: {
    backgroundColor: "#111111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2B2B2B",
    maxHeight: "92%",
  },
  modalThumb: {
    width: 100,
    height: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  gradeChip: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  gradeChipSelected: {
    backgroundColor: "#0057FF",
    borderColor: "#0057FF",
  },
});
