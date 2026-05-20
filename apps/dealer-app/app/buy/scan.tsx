import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_CARD_SEARCH_RESULTS } from "../../src/constants/mockData";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useCardScan, useBarcodeScan } from "../../src/hooks/useCardScan";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
type Tab = "scan" | "barcode" | "search";

const STEP_PCT = "20%";

export default function BuyScanScreen() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);
  const [activeTab, setActiveTab] = useState<Tab>("scan");
  const [query, setQuery] = useState("");

  const filtered = MOCK_CARD_SEARCH_RESULTS.filter(
    (c) =>
      c.player_name.toLowerCase().includes(query.toLowerCase()) ||
      c.set_name.toLowerCase().includes(query.toLowerCase()),
  );

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { mutate: scanImage, isPending: isScanning } = useCardScan();
  const { mutate: scanBarcode, isPending: isScanningBarcode } =
    useBarcodeScan();

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (photo.base64) {
        scanImage(photo.base64);
      }
    } catch (error) {
      console.error("Camera capture failed:", error);
    }
  };

  const handleSimulateScan = () => {
    // Fallback for testing without camera
    const card = MOCK_CARD_SEARCH_RESULTS[0];
    addTab({ type: "buy", step: 2, cardData: card });
    router.push("/buy/comps");
  };

  const handleSelectCard = (card: (typeof MOCK_CARD_SEARCH_RESULTS)[0]) => {
    addTab({ type: "buy", step: 2, cardData: card });
    router.push("/buy/comps");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 1 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(["scan", "barcode", "search"] as Tab[]).map((t) => (
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
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
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
                {/* Full-screen camera feed */}
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  mode="picture"
                />

                {/* Dark mask — top */}
                <View style={styles.maskTop} />
                {/* Dark mask — bottom */}
                <View style={styles.maskBottom} />
                {/* Dark mask — left */}
                <View style={styles.maskLeft} />
                {/* Dark mask — right */}
                <View style={styles.maskRight} />

                {/* Card frame */}
                <View style={styles.cardFrame} pointerEvents="none">
                  {/* Corner accents */}
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

                {/* Hint label */}
                <View style={styles.hintBadge}>
                  <Text style={styles.hintText}>
                    Align card within the frame
                  </Text>
                </View>

                {(isScanning || isScanningBarcode) && (
                  <View style={styles.scanningOverlay}>
                    <ActivityIndicator color="#0057FF" size="large" />
                    <Text style={styles.scanningText}>Identifying card...</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (isScanning || isScanningBarcode) && styles.disabledBtn,
                ]}
                onPress={handleCapture}
                activeOpacity={0.85}
                disabled={isScanning || isScanningBarcode}
              >
                <Text style={styles.primaryBtnText}>
                  {isScanning ? "Scanning..." : "Capture Card"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.simulateBtn}
                onPress={handleSimulateScan}
                disabled={isScanning || isScanningBarcode}
              >
                <Text style={styles.simulateText}>Simulate Scan (Debug)</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* BARCODE tab */}
      {activeTab === "barcode" && (
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonCard}>
            <Ionicons name="barcode-outline" size={64} color="#0057FF" style={{ marginBottom: 16 }} />
            <Text style={styles.comingSoonTitle}>Barcode Scanner</Text>
            <Text style={styles.comingSoonSubtitle}>This feature is coming soon</Text>
          </View>
        </View>
      )}

      {/* SEARCH tab */}
      {activeTab === "search" && (
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonCard}>
            <Ionicons name="search-outline" size={64} color="#0057FF" style={{ marginBottom: 16 }} />
            <Text style={styles.comingSoonTitle}>Card Database Search</Text>
            <Text style={styles.comingSoonSubtitle}>This feature is coming soon</Text>
          </View>
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
  progressFill: { height: 3, backgroundColor: "#0057FF" },
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
  tabActive: { borderBottomColor: "#0057FF" },
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
    borderColor: "rgba(0,87,255,0.5)",
  },
  frameCorner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#0057FF",
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
  hintText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  cameraArea: {
    width: "100%",
    aspectRatio: 2,
    backgroundColor: "#0D0D0D",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 24,
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "white",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  permissionText: {
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanningText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  simulateBtn: {
    marginTop: 12,
    padding: 12,
  },
  simulateText: {
    color: "#555555",
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: "#0057FF",
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
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 48, color: "white", fontSize: 15 },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  searchResultName: { color: "white", fontWeight: "600", fontSize: 15 },
  searchResultMeta: { color: "#888888", fontSize: 12, marginTop: 2 },
  sportChip: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sportChipText: { color: "#888888", fontSize: 11, fontWeight: "600" },
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
