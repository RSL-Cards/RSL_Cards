import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useInventory } from "../../src/hooks/useCardScan";
import RSLLoader from "../../src/components/RSLLoader";

const STEP_PCT = "20%";

export default function AddExistingCardScreen() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch, isRefetching } = useInventory({ limit: 100 });

  const inventoryItems = data?.items || [];

  const filteredItems = useMemo(() => {
    if (!query) return inventoryItems;
    return inventoryItems.filter(
      (c: any) =>
        (c.player_name?.toLowerCase() || "").includes(query.toLowerCase()) ||
        (c.set_name?.toLowerCase() || "").includes(query.toLowerCase())
    );
  }, [inventoryItems, query]);

  const handleSelectCard = (card: any) => {
    const grading =
      card.grade_company && card.grade_company !== "RAW"
        ? {
            company: card.grade_company,
            grade: card.grade_value || "",
            cert_number: card.cert_number || "",
          }
        : undefined;

    addTab({ 
      type: "buy", 
      step: 2, 
      isExisting: true,
      cardData: { 
        ...card, 
        grading 
      } 
    });
    router.push("/buy/comps");
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => handleSelectCard(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="albums-outline" size={24} color="#0057FF" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardPlayer}>{item.player_name || "Unknown Player"}</Text>
        <Text style={styles.cardMeta}>
          {item.year} {item.set_name} {item.variation ? `- ${item.variation}` : ""}
        </Text>
      </View>
      <View style={styles.cardGrade}>
        <Text style={styles.gradeText}>
          {item.grade_company || "RAW"} {item.grade_value || ""}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );

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

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Select Card from Inventory</Text>
        <Text style={styles.subtitle}>Choose an existing card to add to this deal.</Text>

        <View style={styles.searchRow}>
          <Ionicons name="search" color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by player or set..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <RSLLoader size={32} />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="albums-outline" size={48} color="#444" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No cards found.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={isRefetching}
          />
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
  progressFill: { height: 3, backgroundColor: "#0057FF" },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 48, color: "white", fontSize: 15 },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(0,87,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardPlayer: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardMeta: {
    color: "#888",
    fontSize: 13,
  },
  cardGrade: {
    backgroundColor: "#222",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  gradeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 16,
    fontSize: 15,
  },
  emptyText: {
    color: "#888",
    fontSize: 15,
  },
});
