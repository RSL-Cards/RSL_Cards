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
import { MOCK_INVENTORY } from "../../src/constants/mockData";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useCardScan } from "../../src/hooks/useCardScan";

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

  const filtered = MOCK_INVENTORY.filter(
    (c) =>
      c.player_name.toLowerCase().includes(query.toLowerCase()) ||
      c.set_name.toLowerCase().includes(query.toLowerCase()),
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
    const card = MOCK_INVENTORY[0];
    addTab({ type: "sell", step: 2, cardData: card });
    router.push("/sell/price");
  };

  const handleSelectCard = (card: (typeof MOCK_INVENTORY)[0]) => {
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
        <View style={styles.scanContent}>
          {!permission?.granted ? (
            <View style={{ alignItems: "center", paddingTop: 40, gap: 16 }}>
              <Text
                style={{ color: "#888888", fontSize: 14, textAlign: "center" }}
              >
                Camera permission needed to scan cards
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={requestPermission}
              >
                <Text style={styles.primaryBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.cameraWrapper}>
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  mode="picture"
                />

                {/* Dark masks */}
                <View style={styles.maskTop} />
                <View style={styles.maskBottom} />
                <View style={styles.maskLeft} />
                <View style={styles.maskRight} />

                {/* Card frame */}
                <View style={styles.cardFrame} pointerEvents="none">
                  <View
                    style={[
                      styles.frameCorner,
                      {
                        top: -2,
                        left: -2,
                        borderTopWidth: 3,
                        borderLeftWidth: 3,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.frameCorner,
                      {
                        top: -2,
                        right: -2,
                        borderTopWidth: 3,
                        borderRightWidth: 3,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.frameCorner,
                      {
                        bottom: -2,
                        left: -2,
                        borderBottomWidth: 3,
                        borderLeftWidth: 3,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.frameCorner,
                      {
                        bottom: -2,
                        right: -2,
                        borderBottomWidth: 3,
                        borderRightWidth: 3,
                      },
                    ]}
                  />
                </View>

                {/* Hint */}
                <View style={styles.hintBadge}>
                  <Text style={styles.hintText}>
                    Align card within the frame
                  </Text>
                </View>

                {isScanning && (
                  <View style={styles.scanningOverlay}>
                    <ActivityIndicator color="#E8001C" size="large" />
                    <Text
                      style={{
                        color: "white",
                        marginTop: 10,
                        fontWeight: "700",
                      }}
                    >
                      Identifying card...
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, isScanning && styles.disabledBtn]}
                onPress={handleCapture}
                disabled={isScanning}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  {isScanning ? "Scanning..." : "Capture Card"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.simulateBtn}
                onPress={handleSimulateScan}
                disabled={isScanning}
              >
                <Text style={styles.simulateText}>Simulate Scan (Debug)</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* SEARCH tab — shows inventory */}
      {activeTab === "search" && (
        <View style={{ flex: 1, paddingTop: 16 }}>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your inventory..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>
          <Text
            style={{
              color: "#888888",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              paddingHorizontal: 20,
              marginBottom: 8,
            }}
          >
            YOUR INVENTORY
          </Text>
          <FlatList
            data={filtered}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                style={styles.inventoryRow}
                onPress={() => handleSelectCard(item)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.invName}>{item.player_name}</Text>
                  <Text style={styles.invMeta}>
                    {item.year} · {item.set_name} ·{" "}
                    {item.grade_key.replace("_", " ")}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                  >
                    ${item.current_market_value}
                  </Text>
                  <Text
                    style={{ color: "#888888", fontSize: 11, marginTop: 2 }}
                  >
                    cost ${item.cost_basis}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
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
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 48, color: "white", fontSize: 15 },
  inventoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  invName: { color: "white", fontWeight: "600", fontSize: 15 },
  invMeta: { color: "#888888", fontSize: 12, marginTop: 2 },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: { opacity: 0.5 },
  simulateBtn: { marginTop: 12, paddingVertical: 10, alignItems: "center" },
  simulateText: { color: "#555555", fontSize: 13 },
});
