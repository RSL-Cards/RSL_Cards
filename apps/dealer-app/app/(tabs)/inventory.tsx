import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import {
  MOCK_INVENTORY,
  MOCK_INVENTORY_SUMMARY,
} from "../../src/constants/mockData";

const SPORTS = ["All", "Football", "Baseball", "Basketball", "Hockey"];

function GradeChip({ gradeKey }: { gradeKey: string }) {
  const configs: Record<string, { bg: string; color: string; label: string }> =
    {
      PSA_10: { bg: "#FFD700", color: "#000000", label: "PSA 10" },
      PSA_9: { bg: "#1A1A1A", color: "#FFD700", label: "PSA 9" },
      BGS_9: { bg: "#0057FF", color: "#FFFFFF", label: "BGS 9" },
      RAW: { bg: "#2A2A2A", color: "#888888", label: "RAW" },
    };
  const cfg = configs[gradeKey] || {
    bg: "#2A2A2A",
    color: "#888888",
    label: gradeKey,
  };
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ color: cfg.color, fontSize: 11, fontWeight: "700" }}>
        {cfg.label}
      </Text>
    </View>
  );
}

function InventoryCard({ item }: { item: (typeof MOCK_INVENTORY)[0] }) {
  const router = useRouter();
  const isAging = item.days_held >= 60;
  const isLoss = item.unrealized_gain < 0;

  let leftBorderColor = "transparent";
  if (isAging && isLoss) leftBorderColor = "#E8001C";
  else if (isAging) leftBorderColor = "#FFB300";
  else if (isLoss) leftBorderColor = "#E8001C";

  const initials = item.player_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/inventory/${item.id}`)}
      style={[
        styles.card,
        {
          borderLeftColor: leftBorderColor,
          borderLeftWidth: leftBorderColor !== "transparent" ? 3 : 0,
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Image placeholder */}
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: "#555555", fontSize: 16, fontWeight: "700" }}>
            {initials}
          </Text>
        </View>
        {/* Card details */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 15,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.player_name}
            </Text>
            <GradeChip gradeKey={item.grade_key} />
          </View>
          <Text style={{ color: "#888888", fontSize: 12, marginBottom: 8 }}>
            {item.year} · {item.set_name}
            {item.variation ? ` · ${item.variation}` : ""}
          </Text>
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 8 }}>
            <View>
              <Text
                style={{
                  color: "#555555",
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                COST
              </Text>
              <Text
                style={{
                  color: "#888888",
                  fontSize: 13,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                ${item.cost_basis.toFixed(0)}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: "#555555",
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                MARKET
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 13,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                ${item.current_market_value.toFixed(0)}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                backgroundColor:
                  item.unrealized_gain >= 0
                    ? "rgba(0,200,83,0.15)"
                    : "rgba(232,0,28,0.15)",
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: item.unrealized_gain >= 0 ? "#00C853" : "#E8001C",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {item.unrealized_gain >= 0 ? "+" : ""}$
                {item.unrealized_gain.toFixed(0)} (
                {item.unrealized_gain_pct >= 0 ? "+" : ""}
                {item.unrealized_gain_pct}%)
              </Text>
            </View>
            <Text
              style={{ color: isAging ? "#FFB300" : "#555555", fontSize: 11 }}
            >
              {item.days_held}d {isAging ? "⚠️" : ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function InventoryScreen() {
  const [selectedSport, setSelectedSport] = useState<string>("All");

  const filtered =
    selectedSport === "All"
      ? MOCK_INVENTORY
      : MOCK_INVENTORY.filter((i) => i.sport === selectedSport);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000000" }}
     
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Text style={{ color: "#888888", fontSize: 13 }}>
          {MOCK_INVENTORY_SUMMARY.total_cards} cards
        </Text>
      </View>

      {/* Summary strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 10,
          paddingVertical: 8,
        }}
      >
        {[
          {
            label: "CARDS",
            value: `${MOCK_INVENTORY_SUMMARY.total_cards}`,
            color: "white",
          },
          {
            label: "COST",
            value: `$${MOCK_INVENTORY_SUMMARY.total_cost_basis.toLocaleString()}`,
            color: "#888888",
          },
          {
            label: "MARKET",
            value: `$${MOCK_INVENTORY_SUMMARY.total_market_value.toLocaleString()}`,
            color: "white",
          },
          {
            label: "GAIN",
            value: `+$${MOCK_INVENTORY_SUMMARY.total_unrealized_gain}`,
            color: "#00C853",
          },
          {
            label: "LISTED",
            value: `${MOCK_INVENTORY_SUMMARY.listed_count}`,
            color: "#0057FF",
          },
        ].map((s) => (
          <View key={s.label} style={styles.statChip}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>
              {s.value}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Sport filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          paddingVertical: 8,
        }}
      >
        {SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.filterChip,
              selectedSport === sport && styles.filterChipActive,
            ]}
            onPress={() => setSelectedSport(sport)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedSport === sport && styles.filterChipTextActive,
              ]}
            >
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlashList
        data={filtered}
        {...({ estimatedItemSize: 130 } as any)}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => <InventoryCard item={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "white" },
  statChip: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statLabel: {
    color: "#555555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: { fontSize: 15, fontWeight: "700" },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  filterChipActive: { backgroundColor: "#E8001C", borderColor: "#E8001C" },
  filterChipText: { color: "#888888", fontSize: 13, fontWeight: "600" },
  filterChipTextActive: { color: "white" },
  card: {
    backgroundColor: "#111111",
    borderRadius: 16,
    marginBottom: 10,
    padding: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  imagePlaceholder: {
    width: 60,
    height: 80,
    backgroundColor: "#222222",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
