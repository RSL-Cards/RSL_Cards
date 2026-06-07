import { useState, useCallback, useEffect } from "react";
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
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useInventory, useInventorySummary } from "../../src/hooks/useCardScan";
import { useAuthStore } from "../../src/stores/authStore";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";
import { Button } from "../../src/components/ui/Button";

const ALL_SPORTS = [
  { key: "Football", emoji: "🏈" },
  { key: "Baseball", emoji: "⚾" },
  { key: "Basketball", emoji: "🏀" },
  { key: "Hockey", emoji: "🏒" },
  { key: "Soccer", emoji: "⚽" },
  { key: "MMA", emoji: "🥊" },
  { key: "Other", emoji: "🏅" },
];

const GRADE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  PSA_10: { bg: "#FFD700", color: COLORS.zinc950, label: "PSA 10" },
  PSA_9: { bg: COLORS.zinc800, color: "#FFD700", label: "PSA 9" },
  BGS_9: { bg: COLORS.primaryLight, color: COLORS.white, label: "BGS 9" },
  BGS_95: { bg: COLORS.primaryLight, color: COLORS.white, label: "BGS 9.5" },
  RAW: { bg: COLORS.zinc800, color: COLORS.zinc400, label: "RAW" },
};

function GradeChip({ gradeKey }: { gradeKey: string }) {
  const cfg = GRADE_CONFIG[gradeKey] ?? {
    bg: COLORS.zinc800,
    color: COLORS.zinc400,
    label: gradeKey,
  };
  return (
    <View style={[styles.gradeChip, { backgroundColor: cfg.bg }]}>
      <Typography variant="label" color={cfg.color} style={{ fontWeight: '800' }}>
        {cfg.label}
      </Typography>
    </View>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === "listed" ? COLORS.success : COLORS.zinc500;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs }}>
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }}
      />
      <Typography variant="caption" weight="600" color={color} style={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 10 }}>
        {status}
      </Typography>
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
  const dbDate = item.added_at || item.addedAt;
  let addedAt = new Date();
  if (dbDate) {
    let dateStr = dbDate;
    if (typeof dateStr === "string") {
      // Convert Postgres "2026-04-28 18:18:26.688438+00" to valid ISO "2026-04-28T18:18:26Z"
      dateStr = dateStr.replace(" ", "T").replace(/\.\d+/, "");
      if (dateStr.endsWith("+00")) dateStr = dateStr.replace("+00", "Z");
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      addedAt = parsed;
    }
  }
  const daysHeld = Math.max(1, Math.ceil((Date.now() - addedAt.getTime()) / 86400000));
  const isAging = daysHeld >= 60;
  const isLoss = unrealizedGain < 0;
  const gainColor = unrealizedGain >= 0 ? COLORS.success : COLORS.destructive;
  const status = item.listing_status ?? "unlisted";

  const accentColor =
    isAging && isLoss
      ? COLORS.destructive
      : isAging
        ? COLORS.warning
        : isLoss
          ? COLORS.destructive
          : null;

  const initials = (item.player_name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity onPress={() => router.push(`/inventory/${item.id}`)} activeOpacity={0.75}>
      <Surface
        variant="elevated"
        style={[
          styles.card,
          accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : null,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Thumbnail */}
          <View style={styles.thumb}>
            {item.photos?.[0] ? (
              <Image source={{ uri: item.photos[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <Typography variant="h3" weight="800" color={COLORS.zinc500}>{initials}</Typography>
            )}
            {item.quantity > 1 && (
              <View style={styles.qtyBadge}>
                <Typography variant="caption" weight="700" color={COLORS.white} style={{ fontSize: 9 }}>×{item.quantity}</Typography>
              </View>
            )}
          </View>

          {/* Main content */}
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            {/* Row 1 — name + grade */}
            <View style={styles.row}>
              <Typography variant="body" weight="700" numberOfLines={1} style={{ flex: 1, marginRight: SPACING.sm }}>
                {item.player_name}
              </Typography>
              <GradeChip gradeKey={item.grade_key} />
            </View>

            {/* Row 2 — set info */}
            <Typography variant="caption" color={COLORS.zinc500} numberOfLines={1} style={{ marginTop: 2 }}>
              {item.year} {item.set_name}
              {item.variation ? ` · ${item.variation}` : ""}
            </Typography>

            {/* Row 3 — prices */}
            <View style={[styles.row, { marginTop: SPACING.sm }]}>
              <View style={styles.priceBlock}>
                <Typography variant="label" color={COLORS.zinc500}>COST</Typography>
                <Typography variant="body" weight="600" color={COLORS.zinc400}>
                  ${costBasis.toLocaleString()}
                </Typography>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceBlock}>
                <Typography variant="label" color={COLORS.zinc500}>MARKET</Typography>
                <Typography variant="body" weight="700" color={COLORS.white}>
                  {marketValue > 0 ? `$${marketValue.toLocaleString()}` : "—"}
                </Typography>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceBlock}>
                <Typography variant="label" color={COLORS.zinc500}>P&L</Typography>
                <Typography variant="body" weight="700" color={marketValue > 0 ? gainColor : COLORS.zinc500}>
                  {marketValue > 0 ? `${unrealizedGain >= 0 ? "+" : ""}$${Math.abs(unrealizedGain).toFixed(0)}` : "—"}
                </Typography>
              </View>
            </View>

            {/* Row 4 — status + days + pct */}
            <View style={[styles.row, { marginTop: SPACING.sm, alignItems: "center" }]}>
              <StatusDot status={status} />
              <View style={{ flex: 1 }} />
              {marketValue > 0 && (
                <View
                  style={[
                    styles.pctPill,
                    { backgroundColor: unrealizedGain >= 0 ? "rgba(16,185,129,0.12)" : "rgba(225,29,72,0.12)" },
                  ]}
                >
                  <Typography variant="caption" weight="700" color={gainColor}>
                    {unrealizedGainPct >= 0 ? "+" : ""}
                    {unrealizedGainPct}%
                  </Typography>
                </View>
              )}
              <Typography variant="caption" weight="600" color={isAging ? COLORS.warning : COLORS.zinc400}>
                {isAging ? "⚠ " : ""}
                {daysHeld}d
              </Typography>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

function InventoryScreen() {
  const router = useRouter();
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

  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const { data: inventoryData, isLoading, isRefetching, refetch } = useInventory({ sport, page, limit: 5 });
  const { data: summary } = useInventorySummary();

  useEffect(() => {
    setPage(1);
    setAllItems([]);
  }, [selectedSport]);

  useEffect(() => {
    if (inventoryData?.items) {
      if (page === 1) {
        setAllItems(inventoryData.items);
      } else {
        setAllItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const newItems = inventoryData.items.filter((i: any) => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
      }
      setIsFetchingNextPage(false);
    }
  }, [inventoryData, page]);

  const totalFilteredCards = inventoryData?.pagination?.total ?? 0;
  const hasMore = allItems.length < totalFilteredCards;

  const handleLoadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      setIsFetchingNextPage(true);
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    await refetch();
  };

  const renderFooter = () => {
    if (allItems.length === 0) return null;
    if (!hasMore) {
      return (
        <View style={styles.footerContainer}>
          <Typography variant="caption" color={COLORS.zinc500}>Showing all {totalFilteredCards} cards</Typography>
        </View>
      );
    }

    return (
      <View style={styles.footerContainer}>
        {isFetchingNextPage ? (
          <ActivityIndicator color={COLORS.primary} size="small" style={{ marginVertical: 8 }} />
        ) : (
          <Button
            label={`Load More (${allItems.length} of ${totalFilteredCards})`}
            variant="secondary"
            onPress={handleLoadMore}
          />
        )}
      </View>
    );
  };

  const totalCards = Number(summary?.total_cards ?? 0);
  const totalCost = parseFloat(summary?.total_cost_basis ?? "0");
  const totalMarket = parseFloat(summary?.total_market_value ?? "0");
  const totalGain = parseFloat(summary?.total_unrealized_gain ?? "0");
  const totalGainPct =
    totalCost > 0 ? Math.round((totalGain / totalCost) * 100) : 0;
  const gainColor = totalGain >= 0 ? COLORS.success : COLORS.destructive;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Typography variant="h1" weight="800">Inventory</Typography>
          <Typography variant="caption" color={COLORS.zinc400}>{totalCards} cards</Typography>
        </View>
        <Button label="+ Add" onPress={() => router.push("/buy/scan")} size="sm" />
      </View>

      {/* ── SUMMARY STRIP ── */}
      <Surface variant="glass" padding="none" style={styles.summaryStrip}>
        {[
          { label: "COST BASIS", value: `$${totalCost.toLocaleString()}`, color: COLORS.zinc400 },
          { label: "MARKET VAL", value: totalMarket > 0 ? `$${totalMarket.toLocaleString()}` : "—", color: COLORS.white },
          { label: "UNREALIZED", value: totalMarket > 0 ? `${totalGain >= 0 ? "+" : ""}$${Math.abs(totalGain).toFixed(0)}` : "—", color: gainColor },
          { label: "GAIN %", value: totalMarket > 0 ? `${totalGainPct >= 0 ? "+" : ""}${totalGainPct}%` : "—", color: gainColor },
        ].map((s, i, arr) => (
          <View key={s.label} style={[styles.summaryCell, i < arr.length - 1 && styles.summaryCellBorder]}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.xs }}>{s.label}</Typography>
            <Typography variant="body" weight="700" color={s.color}>{s.value}</Typography>
          </View>
        ))}
      </Surface>

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
              <Typography variant="body">{s.emoji}</Typography>
              <Typography variant="body" weight={isActive ? "700" : "600"} color={isActive ? COLORS.white : COLORS.zinc400}>
                {s.key}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── DIVIDER ── */}
      <View style={{ height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg, marginBottom: 4 }} />

      {/* ── LIST ── */}
      {isLoading && allItems.length === 0 ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => <InventoryCard item={item} />}
          contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={isRefetching}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Typography variant="body" color={COLORS.zinc500}>No cards yet</Typography>
              <Typography variant="caption" color={COLORS.zinc600} style={{ marginTop: 6 }}>Cards added via buy flow appear here</Typography>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  summaryCell: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  summaryCellBorder: { borderRightWidth: 1, borderRightColor: COLORS.border },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    gap: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  card: {
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  thumb: {
    width: 56,
    height: 76,
    backgroundColor: COLORS.zinc800,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  qtyBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gradeChip: { borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
  priceBlock: { flex: 1, alignItems: "center" },
  priceDivider: { width: 1, height: 28, backgroundColor: COLORS.border },
  pctPill: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  footerContainer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
});

// Export without error boundary for now
export default InventoryScreen;
