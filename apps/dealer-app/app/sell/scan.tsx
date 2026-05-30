import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useCardScan, useInventory } from "../../src/hooks/useCardScan";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Tab = "scan" | "search";
const STEP_PCT = "20%";

export default function SellScanScreen() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);
  const [activeTab, setActiveTab] = useState<Tab>("scan");
  const [query, setQuery] = useState("");

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { mutate: scanImage, isPending: isScanning } = useCardScan("sell");

  // Live inventory from API
  const { data: inventoryData, isLoading: inventoryLoading } = useInventory({ status: 'available' });
  const allItems = inventoryData?.items ?? [];
  const filtered =
    query.trim().length === 0
      ? allItems
      : allItems.filter(
          (c: any) =>
            c.player_name?.toLowerCase().includes(query.toLowerCase()) ||
            c.set_name?.toLowerCase().includes(query.toLowerCase()) ||
            String(c.year ?? "").includes(query),
        );

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      if (photo?.base64) scanImage(photo.base64);
    } catch (error) {
      console.error("Camera capture failed:", error);
    }
  };

  const handleSimulateScan = () => {
    const card = allItems[0];
    if (!card) return;
    addTab({ type: "sell", step: 2, cardData: card });
    router.push("/sell/price");
  };

  const handleSelectCard = (card: any) => {
    addTab({ type: "sell", step: 2, cardData: card });
    router.push("/sell/price");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELL — Step 1 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(["scan", "search"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text
              style={[styles.tabText, activeTab === t && styles.tabTextActive]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SCAN tab */}
      {activeTab === "scan" && (
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonCard}>
            <Ionicons
              name="camera-outline"
              size={56}
              color="#E8001C"
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.comingSoonTitle}>Card Scanning Coming Soon</Text>
            <Text style={styles.comingSoonSubtitle}>
              We are currently perfecting our computer vision model to identify raw and graded cards.
              {"\n\n"}
              In the meantime, please use the **Search** tab to select cards from your inventory.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 28 }]}
              onPress={() => setActiveTab("search")}
            >
              <Text style={styles.primaryBtnText}>Use Inventory Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SEARCH tab */}
      {activeTab === "search" && (
        <View style={{ flex: 1, paddingTop: 16 }}>
          {/* Search bar */}
          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#555555"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search player, year, set..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="#555555" />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading state */}
          {inventoryLoading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color="#E8001C" size="large" />
              <Text style={styles.stateText}>Loading inventory...</Text>
            </View>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <View style={styles.centeredState}>
              <Ionicons
                name="cube-outline"
                size={48}
                color="#333333"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.stateTitle}>
                {query.trim().length > 0
                  ? "No matches found"
                  : "No inventory yet"}
              </Text>
              <Text style={styles.stateText}>
                {query.trim().length > 0
                  ? "Try a different player name or set"
                  : "Add cards via camera scan to see them here"}
              </Text>
            </View>
          ) : (
            /* Results */
            <>
              <Text style={styles.sectionLabel}>
                {filtered.length} CARD{filtered.length !== 1 ? "S" : ""}
              </Text>
              <FlatList
                data={filtered}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => {
                  const gain =
                    parseFloat(item.current_market_value ?? "0") -
                    parseFloat(item.cost_basis ?? "0");
                  const gainPositive = gain >= 0;
                  return (
                    <TouchableOpacity
                      style={styles.inventoryRow}
                      onPress={() => handleSelectCard(item)}
                      activeOpacity={0.75}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.invName}>{item.player_name}</Text>
                        <Text style={styles.invMeta}>
                          {item.year} · {item.set_name} ·{" "}
                          {(item.grade_key ?? "RAW").replace("_", " ")}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.invPrice}>
                          $
                          {parseFloat(item.current_market_value ?? "0").toFixed(
                            0,
                          )}
                        </Text>
                        <Text
                          style={[
                            styles.invGain,
                            { color: gainPositive ? "#00C853" : "#E8001C" },
                          ]}
                        >
                          {gainPositive ? "+" : ""}
                          {gain.toFixed(0)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          )}
        </View>
      )}
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { color: "#888888", fontSize: 20 },
  headerTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  progressBar: { height: 3, backgroundColor: "#1A1A1A" },
  progressFill: { height: 3, backgroundColor: "#E8001C" },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#E8001C" },
  tabText: { color: "#555555", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "white", fontWeight: "700" },
  scanContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: "center",
  },
  cameraWrapper: {
    width: SCREEN_WIDTH - 40,
    height: (SCREEN_WIDTH - 40) * (3.5 / 2.5),
    alignSelf: "center",
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#000",
    borderRadius: 4,
  },
  maskTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "8%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  maskBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "8%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  maskLeft: {
    position: "absolute",
    top: "8%",
    bottom: "8%",
    left: 0,
    width: "5%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  maskRight: {
    position: "absolute",
    top: "8%",
    bottom: "8%",
    right: 0,
    width: "5%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  cardFrame: {
    position: "absolute",
    top: "8%",
    left: "5%",
    right: "5%",
    bottom: "8%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(232,0,28,0.5)",
  },
  frameCorner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#E8001C",
    borderRadius: 3,
  },
  hintBadge: {
    position: "absolute",
    bottom: "10%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  hintText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  primaryBtn: {
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: { opacity: 0.5 },
  simulateBtn: { marginTop: 12, paddingVertical: 10, alignItems: "center" },
  simulateText: { color: "#555555", fontSize: 13 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  searchInput: { flex: 1, height: 48, color: "white", fontSize: 15 },
  sectionLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  inventoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  invName: { color: "white", fontWeight: "600", fontSize: 15 },
  invMeta: { color: "#555555", fontSize: 12, marginTop: 2 },
  invPrice: { color: "white", fontWeight: "700", fontSize: 15 },
  invGain: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  stateTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  stateText: {
    color: "#555555",
    fontSize: 13,
    textAlign: "center",
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  comingSoonCard: {
    backgroundColor: "#111111",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#222222",
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  comingSoonTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  comingSoonSubtitle: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },
});
