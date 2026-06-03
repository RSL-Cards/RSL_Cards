import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useInventory } from "../../src/hooks/useCardScan";
import { useAuthStore } from "../../src/stores/authStore";
import { apiClient } from "../../src/lib/apiClient";

const PLATFORM_DEFS = [
  {
    key: "ebay",
    label: "eBay",
    icon: "",
    feePct: 0.1285,
    flatFee: 0,
    color: "#0057FF",
  },
  {
    key: "whatnot",
    label: "Whatnot",
    icon: "",
    feePct: 0.08,
    flatFee: 0,
    color: "#9B59B6",
  },
  {
    key: "tcgplayer",
    label: "TCGPlayer",
    icon: "",
    feePct: 0.1025,
    flatFee: 0,
    color: "#00C853",
  },
  {
    key: "shopify",
    label: "Shopify",
    icon: "",
    feePct: 0.02,
    flatFee: 0,
    color: "#96BF48",
  },
  {
    key: "mercari",
    label: "Mercari",
    icon: "",
    feePct: 0.1,
    flatFee: 0,
    color: "#FF4F4F",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "",
    feePct: 0.05,
    flatFee: 0,
    color: "#1877F2",
  },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { inventoryId } = useLocalSearchParams<{ inventoryId?: string }>();

  const { data: inventoryData, isLoading } = useInventory();
  const cards = inventoryData?.items ?? [];
  const userSellChannels = useAuthStore((s) => s.user?.sellChannels ?? []);

  // Mark a platform connected if user selected it during onboarding
  // Normalise to lowercase for comparison ("eBay" → "ebay")
  const PLATFORMS = PLATFORM_DEFS.map((p) => ({
    ...p,
    connected: userSellChannels.some(
      (ch) => ch.toLowerCase() === p.label.toLowerCase(),
    ),
  }));

  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    inventoryId ?? null,
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("USED_EXCELLENT");
  const [format, setFormat] = useState("FIXED_PRICE");
  const [isPublishing, setIsPublishing] = useState(false);

  // Pre-select the card passed in from inventory detail
  useEffect(() => {
    if (inventoryId) setSelectedCardId(inventoryId);
  }, [inventoryId]);

  const selectedCard = cards.find((c: any) => c.id === selectedCardId) ?? null;
  const numPrice = parseFloat(price) || 0;

  const connectedPlatforms = PLATFORMS.filter((p) => p.connected);
  const platformFeeData = connectedPlatforms
    .map((p) => {
      const fee = numPrice * p.feePct + p.flatFee;
      const net = numPrice - fee;
      return { ...p, fee, net };
    })
    .sort((a, b) => b.net - a.net);

  const togglePlatform = (key: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const autoTitle = selectedCard
    ? [
        selectedCard.year,
        selectedCard.player_name,
        selectedCard.set_name,
        selectedCard.variation,
        selectedCard.grade_key?.replace("_", " "),
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const handlePublish = async () => {
    if (!selectedCardId || !price || selectedPlatforms.length === 0) return;
    
    setIsPublishing(true);
    try {
      await apiClient.post("/v1/listings/publish-ebay", {
        inventoryId: selectedCardId,
        price: parseFloat(price),
        description,
        condition,
        format,
        platforms: selectedPlatforms,
      });

      Alert.alert("Listed!", "Your card has been listed successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Publish Failed", error.message || "Something went wrong.");
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = !!selectedCard && !!price && selectedPlatforms.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>List a Card</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Card selector */}
        <Text style={styles.sectionLabel}>SELECT CARD</Text>
        {isLoading ? (
          <ActivityIndicator color="#333" style={{ marginLeft: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 10,
              paddingBottom: 8,
            }}
          >
            {cards.map((card: any) => {
              const isSelected = card.id === selectedCardId;
              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardChip,
                    isSelected && styles.cardChipSelected,
                  ]}
                  onPress={() => setSelectedCardId(card.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.cardChipName,
                      isSelected && { color: "white" },
                    ]}
                    numberOfLines={1}
                  >
                    {card.player_name}
                  </Text>
                  <Text
                    style={[
                      styles.cardChipMeta,
                      isSelected && { color: "rgba(255,255,255,0.6)" },
                    ]}
                  >
                    {card.grade_key?.replace("_", " ") ?? "RAW"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Auto-title preview */}
        {autoTitle.length > 0 && (
          <View style={styles.titlePreview}>
            <Text style={styles.sectionLabel}>AUTO-GENERATED TITLE</Text>
            <Text style={styles.titlePreviewText}>{autoTitle}</Text>
          </View>
        )}

        {/* Platforms */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>PLATFORMS</Text>
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {PLATFORMS.filter((p) => p.connected).length === 0 ? (
            <TouchableOpacity
              style={styles.platformRowDisconnected}
              onPress={() => router.push("/settings/platforms" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.platformLabelDisconnected}>
                No platforms connected
              </Text>
              <View style={styles.connectBtn}>
                <Text style={styles.connectBtnText}>Connect →</Text>
              </View>
            </TouchableOpacity>
          ) : (
            PLATFORMS.filter((p) => p.connected).map((p) => {
              const isSelected = selectedPlatforms.includes(p.key);
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.platformRow,
                    isSelected && {
                      borderColor: p.color,
                      backgroundColor: `${p.color}12`,
                    },
                  ]}
                  onPress={() => togglePlatform(p.key)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.platformIcon,
                      { backgroundColor: `${p.color}22` },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{p.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.platformLabel,
                      isSelected && { color: "white" },
                    ]}
                  >
                    {p.label}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && {
                        backgroundColor: p.color,
                        borderColor: p.color,
                      },
                    ]}
                  >
                    {isSelected && (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Price input */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>YOUR PRICE</Text>
        <View style={styles.priceInputWrapper}>
          <Text style={styles.priceDollar}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor="#2A2A2A"
            keyboardType="decimal-pad"
          />
        </View>

        {/* eBay specific details */}
        {selectedPlatforms.includes("ebay") && (
          <View>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>CONDITION</Text>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 10 }}>
              {[
                { label: "New", value: "NEW" },
                { label: "Used - Excellent", value: "USED_EXCELLENT" },
                { label: "Used - Poor", value: "USED_POOR" },
              ].map(c => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.chipBtn,
                    condition === c.value && styles.chipBtnActive
                  ]}
                  onPress={() => setCondition(c.value)}
                >
                  <Text style={[
                    styles.chipBtnText,
                    condition === c.value && styles.chipBtnTextActive
                  ]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>FORMAT</Text>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 10 }}>
              {[
                { label: "Buy It Now", value: "FIXED_PRICE" },
                { label: "Auction", value: "AUCTION" },
              ].map(f => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.chipBtn,
                    format === f.value && styles.chipBtnActive
                  ]}
                  onPress={() => setFormat(f.value)}
                >
                  <Text style={[
                    styles.chipBtnText,
                    format === f.value && styles.chipBtnTextActive
                  ]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>DESCRIPTION</Text>
            <View style={styles.descriptionWrapper}>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter a description for your eBay listing..."
                placeholderTextColor="#555555"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        )}

        {/* Fee comparison — only connected platforms */}
        {numPrice > 0 && connectedPlatforms.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>
              FEE COMPARISON
            </Text>
            <View style={styles.feeTable}>
              {platformFeeData.map((p, i) => {
                const isBest = i === 0;
                return (
                  <View
                    key={p.key}
                    style={[
                      styles.feeRow,
                      i < platformFeeData.length - 1 && styles.feeRowBorder,
                      isBest && styles.feeRowBest,
                    ]}
                  >
                    {isBest && (
                      <View style={styles.bestBadge}>
                        <Text style={styles.bestBadgeText}>BEST</Text>
                      </View>
                    )}
                    <Text
                      style={[styles.feePlatform, isBest && { color: "white" }]}
                    >
                      {p.label}
                    </Text>
                    <Text style={styles.feeAmount}>-${p.fee.toFixed(2)}</Text>
                    <Text
                      style={[styles.feeNet, isBest && { color: "#00C853" }]}
                    >
                      ${p.net.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Publish button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.publishBtn, (!canPublish || isPublishing) && styles.publishBtnDisabled]}
          disabled={!canPublish || isPublishing}
          onPress={handlePublish}
          activeOpacity={0.85}
        >
          {isPublishing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.publishBtnText}>
              {canPublish
                ? `Publish on ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""}`
                : "Select card, platform & price"}
            </Text>
          )}
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
    paddingVertical: 16,
  },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "700" },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
  },
  closeBtnText: { color: "#888888", fontSize: 16 },
  sectionLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  cardChip: {
    width: 120,
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardChipSelected: { backgroundColor: "#0057FF", borderColor: "#0057FF" },
  cardChipName: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardChipMeta: { color: "#555555", fontSize: 11 },
  titlePreview: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  titlePreviewText: { color: "white", fontSize: 13, lineHeight: 18 },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#111111",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
  },
  platformRowDisconnected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0A0A0A",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    opacity: 0.7,
  },
  platformIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  platformLabel: { flex: 1, color: "#AAAAAA", fontSize: 15, fontWeight: "600" },
  platformLabelDisconnected: {
    flex: 1,
    color: "#444444",
    fontSize: 15,
    fontWeight: "600",
  },
  connectedBadge: {
    backgroundColor: "rgba(0,200,83,0.12)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  connectedText: { color: "#00C853", fontSize: 11, fontWeight: "600" },
  connectBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  connectBtnText: { color: "#555555", fontSize: 12, fontWeight: "600" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingHorizontal: 20,
  },
  priceDollar: {
    color: "#555555",
    fontSize: 32,
    fontWeight: "700",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    color: "white",
    fontSize: 40,
    fontWeight: "900",
    paddingVertical: 16,
  },
  feeTable: {
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  feeRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 8 },
  feeRowBorder: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  feeRowBest: { borderLeftWidth: 3, borderLeftColor: "#00C853" },
  bestBadge: {
    backgroundColor: "rgba(255,215,0,0.2)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bestBadgeText: { color: "#FFD700", fontSize: 9, fontWeight: "700" },
  feePlatform: { flex: 1, color: "#888888", fontSize: 14, fontWeight: "600" },
  feeAmount: { color: "#E8001C", fontSize: 13, marginRight: 12 },
  feeNet: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    minWidth: 64,
    textAlign: "right",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  publishBtn: {
    backgroundColor: "#0057FF",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  publishBtnDisabled: { backgroundColor: "#1A1A1A" },
  publishBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  chipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#111111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  chipBtnActive: {
    backgroundColor: "rgba(0, 87, 255, 0.15)",
    borderColor: "#0057FF",
  },
  chipBtnText: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "600",
  },
  chipBtnTextActive: {
    color: "#0057FF",
  },
  descriptionWrapper: {
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    padding: 16,
    minHeight: 120,
  },
  descriptionInput: {
    color: "white",
    fontSize: 15,
    textAlignVertical: "top",
  },
});
