import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useInventory } from "../../src/hooks/useCardScan";
import { ActiveLogIndicator } from "../../src/components/ActiveLogIndicator";
import RSLLoader from "../../src/components/RSLLoader";

const STEP_PCT = "25%";

export default function SellScanScreen() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);
  const [query, setQuery] = useState("");

  // Live inventory from API (status: 'available' fetches all unlisted and listed available cards)
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
        <Text style={styles.headerTitle}>SELL — Select Card (1 of 4)</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <ActiveLogIndicator />

      {/* Main Inventory Search & Selection List */}
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
            <RSLLoader size={32} />
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
                : "No unlisted cards in inventory"}
            </Text>
            <Text style={styles.stateText}>
              {query.trim().length > 0
                ? "Try searching a different player name or set"
                : "Add cards to your inventory first to record a sale."}
            </Text>
          </View>
        ) : (
          /* Results */
          <>
            <Text style={styles.sectionLabel}>
              {filtered.length} CARD{filtered.length !== 1 ? "S" : ""} AVAILABLE TO SELL
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
                        {(item.grade_key ?? "RAW").replace(/_/g, " ")}
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
    marginBottom: 8,
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
});
