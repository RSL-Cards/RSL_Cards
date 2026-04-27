import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useInventory, useInventorySummary } from "../../src/hooks/useCardScan";
import { useAuthStore } from "../../src/stores/authStore";

const ALL_SPORTS = [
  { key: "Football", emoji: "�" },
  { key: "Baseball", emoji: "⚾" },
  { key: "Basketball", emoji: "🏀" },
  { key: "Hockey", emoji: "�" },
  { key: "Soccer", emoji: "⚽" },
  { key: "MMA", emoji: "🥊" },
  { key: "Other", emoji: "�" },
];

const GRADE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  PSA_10: { bg: "#FFD700", color: "#000000", label: "PSA 10" },
  PSA_9: { bg: "#1A1A1A", color: "#FFD700", label: "PSA 9" },
  BGS_9: { bg: "#0057FF", color: "#FFFFFF", label: "BGS 9" },
  BGS_95: { bg: "#0057FF", color: "#FFFFFF", label: "BGS 9.5" },
  RAW: { bg: "#1E1E1E", color: "#666666", label: "RAW" },
};

function GradeChip({ gradeKey }: { gradeKey: string }) {
  const cfg = GRADE_CONFIG[gradeKey] ?? {
    bg: "#1E1E1E",
    color: "#666666",
    label: gradeKey,
  };
  return (
    <View style={[styles.gradeChip, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.gradeChipText, { color: cfg.color }]}>
        {cfg.label}
      </Text>
    </View>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === "listed" ? "#00C853" : "#555555";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }}
      />
      <Text
        style={{
          color,
          fontSize: 10,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {status}
      </Text>
    </View>
  );
}

function InventoryCard({ item }: { item: any }) {
  const router = useRouter();
  const costBasis = parseFloat(item.cost_basis ?? "0");
  const marketValue = parseFloat(item.current_market_value ?? "0");
  const unrealizedGain = marketValue > 0 ? marketValue - costBasis : 0;
  const unrealizedGainPct =
    costBasis > 0 && marketValue > 0
      ? Math.round(((marketValue - costBasis) / costBasis) * 100)
      : 0;
  const addedAt = item.added_at ? new Date(item.added_at) : new Date();
  const daysHeld = Math.floor((Date.now() - addedAt.getTime()) / 86400000);
  const isAging = daysHeld >= 60;
  const isLoss = unrealizedGain < 0;
  const gainColor = unrealizedGain >= 0 ? "#00C853" : "#E8001C";
  const status = item.listing_status ?? "unlisted";

  const accentColor =
    isAging && isLoss
      ? "#E8001C"
      : isAging
        ? "#FFB300"
        : isLoss
          ? "#E8001C"
          : null;

  const initials = (item.player_name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/inventory/${item.id}`)}
      style={[
        styles.card,
        accentColor
          ? { borderLeftColor: accentColor, borderLeftWidth: 3 }
          : null,
      ]}
      activeOpacity={0.75}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Thumbnail */}
        <View style={styles.thumb}>
          {item.photos?.[0] ? (
            <Image
              source={{ uri: item.photos[0] }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.thumbText}>{initials}</Text>
          )}
          {item.quantity > 1 && (
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>×{item.quantity}</Text>
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          {/* Row 1 — name + grade */}
          <View style={styles.row}>
            <Text style={styles.playerName} numberOfLines={1}>
              {item.player_name}
            </Text>
            <GradeChip gradeKey={item.grade_key} />
          </View>

          {/* Row 2 — set info */}
          <Text style={styles.setInfo} numberOfLines={1}>
            {item.year} {item.set_name}
            {item.variation ? ` · ${item.variation}` : ""}
          </Text>

          {/* Row 3 — prices */}
          <View style={[styles.row, { marginTop: 10 }]}>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>COST</Text>
              <Text style={styles.priceMuted}>
                ${costBasis.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.priceDivider]} />
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>MARKET</Text>
              <Text style={styles.priceValue}>
                {marketValue > 0 ? `$${marketValue.toLocaleString()}` : "—"}
              </Text>
            </View>
            <View style={[styles.priceDivider]} />
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>P&L</Text>
              <Text
                style={[
                  styles.priceValue,
                  { color: marketValue > 0 ? gainColor : "#444444" },
                ]}
              >
                {marketValue > 0
                  ? `${unrealizedGain >= 0 ? "+" : ""}$${Math.abs(unrealizedGain).toFixed(0)}`
                  : "—"}
              </Text>
            </View>
          </View>

          {/* Row 4 — status + days + pct */}
          <View style={[styles.row, { marginTop: 8, alignItems: "center" }]}>
            <StatusDot status={status} />
            <View style={{ flex: 1 }} />
            {marketValue > 0 && (
              <View
                style={[
                  styles.pctPill,
                  {
                    backgroundColor:
                      unrealizedGain >= 0
                        ? "rgba(0,200,83,0.12)"
                        : "rgba(232,0,28,0.12)",
                  },
                ]}
              >
                <Text style={[styles.pctText, { color: gainColor }]}>
                  {unrealizedGainPct >= 0 ? "+" : ""}
                  {unrealizedGainPct}%
                </Text>
              </View>
            )}
            <Text
              style={[
                styles.daysText,
                { color: isAging ? "#FFB300" : "#444444" },
              ]}
            >
              {isAging ? "⚠ " : ""}
              {daysHeld}d
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function InventoryScreen() {
  const userSports = useAuthStore((s) => s.user?.sports ?? []);
  const sportTabs = [
    { key: "All", emoji: "🏆" },
    ...ALL_SPORTS.filter((s) =>
      userSports.some((us) => us.toLowerCase() === s.key.toLowerCase()),
    ),
  ];
  const [selectedSport, setSelectedSport] = useState("All");
  const sport =
    selectedSport === "All" ? undefined : selectedSport.toLowerCase();
  const { data: inventoryData, isLoading, refetch } = useInventory({ sport });
  const { data: summary, refetch: refetchSummary } = useInventorySummary();

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchSummary();
    }, [refetch, refetchSummary]),
  );

  const items = inventoryData?.items ?? [];
  const totalCards = Number(summary?.total_cards ?? 0);
  const totalCost = parseFloat(summary?.total_cost_basis ?? "0");
  const totalMarket = parseFloat(summary?.total_market_value ?? "0");
  const totalGain = parseFloat(summary?.total_unrealized_gain ?? "0");
  const totalGainPct =
    totalCost > 0 ? Math.round((totalGain / totalCost) * 100) : 0;
  const gainColor = totalGain >= 0 ? "#00C853" : "#E8001C";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSub}>{totalCards} cards</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* ── SUMMARY STRIP ── */}
      <View style={styles.summaryStrip}>
        {[
          {
            label: "COST BASIS",
            value: `$${totalCost.toLocaleString()}`,
            color: "#888888",
          },
          {
            label: "MARKET VAL",
            value: totalMarket > 0 ? `$${totalMarket.toLocaleString()}` : "—",
            color: "white",
          },
          {
            label: "UNREALIZED",
            value:
              totalMarket > 0
                ? `${totalGain >= 0 ? "+" : ""}$${Math.abs(totalGain).toFixed(0)}`
                : "—",
            color: gainColor,
          },
          {
            label: "GAIN %",
            value:
              totalMarket > 0
                ? `${totalGainPct >= 0 ? "+" : ""}${totalGainPct}%`
                : "—",
            color: gainColor,
          },
        ].map((s, i, arr) => (
          <View
            key={s.label}
            style={[
              styles.summaryCell,
              i < arr.length - 1 && styles.summaryCellBorder,
            ]}
          >
            <Text style={styles.summaryLabel}>{s.label}</Text>
            <Text style={[styles.summaryValue, { color: s.color }]}>
              {s.value}
            </Text>
          </View>
        ))}
      </View>

      {/* ── SPORT FILTERS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        {sportTabs.map((s) => {
          const isActive = selectedSport === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedSport(s.key)}
              activeOpacity={0.75}
            >
              <Text style={styles.filterChipEmoji}>{s.emoji}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {s.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── DIVIDER ── */}
      <View
        style={{
          height: 1,
          backgroundColor: "#1A1A1A",
          marginHorizontal: 20,
          marginBottom: 4,
        }}
      />

      {/* ── LIST ── */}
      {isLoading ? (
        <ActivityIndicator color="#E8001C" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => <InventoryCard item={item} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Text style={{ color: "#555555", fontSize: 15 }}>
                No cards yet
              </Text>
              <Text style={{ color: "#333333", fontSize: 13, marginTop: 6 }}>
                Cards added via buy flow appear here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 12, color: "#555555", marginTop: 2 },
  addBtn: {
    backgroundColor: "#E8001C",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: "white", fontWeight: "700", fontSize: 13 },

  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    marginBottom: 4,
    overflow: "hidden",
  },
  summaryCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  summaryCellBorder: { borderRightWidth: 1, borderRightColor: "#1E1E1E" },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#444444",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: { fontSize: 13, fontWeight: "700" },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },
  filterChipActive: { backgroundColor: "#E8001C", borderColor: "#E8001C" },
  filterChipEmoji: { fontSize: 13 },
  filterChipText: { color: "#666666", fontSize: 13, fontWeight: "600" },
  filterChipTextActive: { color: "white" },
  card: {
    backgroundColor: "#0E0E0E",
    borderRadius: 14,
    marginBottom: 8,
    padding: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  thumb: {
    width: 56,
    height: 76,
    backgroundColor: "#181818",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222222",
    overflow: "hidden",
  },
  thumbText: { color: "#444444", fontSize: 16, fontWeight: "800" },
  qtyBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#E8001C",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  qtyText: { color: "white", fontSize: 9, fontWeight: "700" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playerName: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  setInfo: { color: "#555555", fontSize: 11, marginTop: 3 },

  gradeChip: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  gradeChipText: { fontSize: 11, fontWeight: "800" },

  priceBlock: { flex: 1, alignItems: "center" },
  priceLabel: {
    color: "#444444",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  priceMuted: { color: "#666666", fontSize: 13, fontWeight: "600" },
  priceValue: { color: "white", fontSize: 13, fontWeight: "700" },
  priceDivider: { width: 1, height: 28, backgroundColor: "#1E1E1E" },

  pctPill: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 8,
  },
  pctText: { fontSize: 11, fontWeight: "700" },
  daysText: { fontSize: 11, fontWeight: "600" },
});

// Export without error boundary for now
export default InventoryScreen;
