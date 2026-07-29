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
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import RSLLoader from "../../src/components/RSLLoader";
import { Ionicons } from "@expo/vector-icons";
import { useInventory, useInventorySummary } from "../../src/hooks/useCardScan";
import { inventoryService } from "../../src/services/cardService";
import { useAuthStore } from "../../src/stores/authStore";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";
import { Button } from "../../src/components/ui/Button";
import { useSyncStore } from "../../src/stores/syncStore";
import { CustomAlertModal } from "../../src/components/ui/CustomAlertModal";

const ALL_SPORTS = [
  { key: "Football", iconName: "american-football-outline" as const },
  { key: "Baseball", iconName: "baseball-outline" as const },
  { key: "Basketball", iconName: "basketball-outline" as const },
  { key: "Hockey", iconName: "trophy-outline" as const },
  { key: "Soccer", iconName: "football-outline" as const },
  { key: "MMA", iconName: "fitness-outline" as const },
  { key: "Other", iconName: "medal-outline" as const },
];

export function getGradeConfig(gradeKey?: string, item?: any) {
  const company = (item?.grade_company || item?.gradeCompany || '').toUpperCase().trim()
  const value = (item?.grade_value || item?.gradeValue || '').trim()

  if (gradeKey === 'RAW' || company === 'RAW') {
    return { bg: COLORS.zinc800, color: COLORS.zinc400, label: 'RAW' }
  }

  let finalCompany = company || 'PSA'
  let finalValue = value

  if (gradeKey) {
    if (gradeKey.includes('_')) {
      const parts = gradeKey.split('_')
      if (!company) finalCompany = parts[0].toUpperCase()
      if (!value) finalValue = parts.slice(1).join('.')
    } else if (gradeKey.includes(' ')) {
      const parts = gradeKey.split(' ')
      if (!company) finalCompany = parts[0].toUpperCase()
      if (!value) finalValue = parts.slice(1).join('.')
    } else if (/^\d+(?:\.\d+)?$/.test(gradeKey.trim())) {
      if (!company) finalCompany = 'PSA'
      if (!value) finalValue = gradeKey.trim()
    }
  }

  if (!finalValue && gradeKey) {
    finalValue = gradeKey
  }

  const label = `${finalCompany} ${finalValue}`.trim()

  let bg = COLORS.zinc800
  let color = '#FFD700'

  if (finalCompany === 'PSA') {
    if (finalValue === '10') {
      bg = '#FFD700'
      color = COLORS.zinc950
    } else {
      bg = COLORS.zinc800
      color = '#FFD700'
    }
  } else if (finalCompany === 'BGS') {
    bg = COLORS.primaryLight
    color = COLORS.white
  } else if (finalCompany === 'SGC') {
    bg = COLORS.zinc800
    color = '#00C853'
  } else if (finalCompany === 'CGC') {
    bg = '#0088FF'
    color = COLORS.white
  }

  return { bg, color, label }
}

function GradeChip({ gradeKey, item }: { gradeKey: string; item?: any }) {
  const cfg = getGradeConfig(gradeKey, item)
  return (
    <View style={[styles.gradeChip, { backgroundColor: cfg.bg }]}>
      <Typography variant="label" color={cfg.color} style={{ fontWeight: '800' }}>
        {cfg.label}
      </Typography>
    </View>
  )
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


function InventoryCard({ item, onDelete }: { item: any; onDelete: (item: any) => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
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
            {/* Row 1 — name + grade + delete */}
            <View style={styles.row}>
              <Typography variant="body" weight="700" numberOfLines={1} style={{ flex: 1, marginRight: SPACING.xs }}>
                {item.player_name}
              </Typography>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <GradeChip gradeKey={item.grade_key} item={item} />
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
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
  const queryClient = useQueryClient();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<any>(null);

  const pendingTxs = useSyncStore((s) => s.pendingTransactions);
  const pendingExps = useSyncStore((s) => s.pendingExpenses);
  const syncedItems = useSyncStore((s) => s.syncedItems);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const syncStatus = useSyncStore((s) => s.syncStatus);
  const syncNow = useSyncStore((s) => s.syncNow);
  const retryFailed = useSyncStore((s) => s.retryFailed);
  const clearFailed = useSyncStore((s) => s.clearFailed);

  const pendingCount = pendingTxs.filter((t) => t.status === "pending").length + pendingExps.filter((e) => e.status === "pending").length;
  const failedCount = pendingTxs.filter((t) => t.status === "failed").length + pendingExps.filter((e) => e.status === "failed").length;

  const userSports = useAuthStore((s) => s.user?.sports ?? []);
  const sportTabs = [
    { key: "All", iconName: "apps-outline" as const },
    ...ALL_SPORTS.filter((s) =>
      userSports.some((us) => us.toLowerCase() === s.key.toLowerCase()),
    ),
  ];
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<"active" | "sold">("active");
  const sport =
    selectedSport === "All" ? undefined : selectedSport.toLowerCase();

  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const { data: inventoryData, isLoading, isRefetching, refetch } = useInventory({
    sport,
    status: selectedStatus === "active" ? undefined : "sold",
    page,
    limit: 5,
  });
  const { data: summary } = useInventorySummary();

  useEffect(() => {
    setPage(1);
    setAllItems([]);
  }, [selectedSport, selectedStatus]);

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
        <View style={{ flex: 1 }}>
          <Typography variant="h1" weight="800">Inventory</Typography>
          <Typography variant="caption" color={COLORS.zinc400}>
            {selectedStatus === "active" ? `${totalCards} active cards` : `${totalFilteredCards} sold/traded`}
          </Typography>
        </View>

        {/* ── SYNC INDICATOR TRIGGER ── */}
        <TouchableOpacity
          style={styles.syncIconBtn}
          onPress={() => setShowSyncModal(true)}
          activeOpacity={0.7}
        >
          {failedCount > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="cloud-offline" size={22} color={COLORS.destructive} />
              <View style={[styles.badgeCount, { backgroundColor: COLORS.destructive }]}>
                <Text style={styles.badgeText}>{failedCount}</Text>
              </View>
            </View>
          ) : pendingCount > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="sync" size={22} color={COLORS.warning} />
              <View style={[styles.badgeCount, { backgroundColor: COLORS.warning }]}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            </View>
          ) : (
            <Ionicons name="cloud-done-outline" size={22} color={COLORS.zinc500} />
          )}
        </TouchableOpacity>
      </View>

      {/* ── DEDICATED ACTION ROW ── */}
      <View style={styles.actionRow}>
        <Button
          label="Trade"
          onPress={() => router.push("/trade")}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          label="Add Existing Card"
          onPress={() => router.push("/buy/existing")}
          style={styles.actionButton}
        />
      </View>

      {/* ── ACTIVE / HISTORY SWITCHER ── */}
      <View style={styles.tabBar}>
        {[
          { key: "active", label: "Active" },
          { key: "sold", label: "History" },
        ].map((t) => {
          const isActive = selectedStatus === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setSelectedStatus(t.key as any)}
            >
              <Typography
                variant="body"
                weight={isActive ? "700" : "600"}
                color={isActive ? COLORS.white : COLORS.zinc400}
              >
                {t.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── SUMMARY STRIP ── */}
      {selectedStatus === "active" && (
        <Surface variant="glass" padding="none" style={styles.summaryStrip}>
          {[
            { label: "COST BASIS", value: `$${totalCost.toLocaleString()}`, color: COLORS.zinc400 },
            { label: "MARKET VALUE", value: totalMarket > 0 ? `$${totalMarket.toLocaleString()}` : "—", color: COLORS.white },
            { label: "UNREALIZED", value: totalMarket > 0 ? `${totalGain >= 0 ? "+" : ""}$${Math.abs(totalGain).toFixed(0)}` : "—", color: gainColor },
            { label: "GAIN %", value: totalMarket > 0 ? `${totalGainPct >= 0 ? "+" : ""}${totalGainPct}%` : "—", color: gainColor },
          ].map((s, i, arr) => (
            <View key={s.label} style={[styles.summaryCell, i < arr.length - 1 && styles.summaryCellBorder]}>
              <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.xs, fontSize: 9 }}>{s.label}</Typography>
              <Typography variant="body" weight="700" color={s.color} style={{ fontSize: 13 }}>{s.value}</Typography>
            </View>
          ))}
        </Surface>
      )}

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
              <Ionicons
                name={s.iconName}
                size={14}
                color={isActive ? COLORS.white : COLORS.zinc400}
              />
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
        <RSLLoader size={36} />
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => <InventoryCard item={item} onDelete={(target) => setCardToDelete(target)} />}
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

      {/* ── SYNC MODAL ── */}
      <Modal
        visible={showSyncModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSyncModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowSyncModal(false)} style={styles.modalCloseBtn}>
                <Typography variant="body" color={COLORS.zinc400}>Close</Typography>
              </TouchableOpacity>
              <Typography variant="h3" weight="800" color={COLORS.white}>Sync Status</Typography>
              <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Sync Dashboard Status Card */}
              <Surface variant="glass" padding="md" style={styles.statusCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: SPACING.md }}>
                  {isSyncing ? (
                    <ActivityIndicator size="small" color={COLORS.primaryLight} />
                  ) : failedCount > 0 ? (
                    <Ionicons name="alert-circle" size={24} color={COLORS.destructive} />
                  ) : pendingCount > 0 ? (
                    <Ionicons name="sync" size={24} color={COLORS.warning} />
                  ) : (
                    <Ionicons name="cloud-done" size={24} color={COLORS.success} />
                  )}
                  <Typography variant="body" weight="700" color={COLORS.white}>
                    {isSyncing 
                      ? "Syncing records..." 
                      : failedCount > 0 
                        ? `${failedCount} Sync Error(s) Found` 
                        : pendingCount > 0 
                          ? `${pendingCount} Record(s) Pending Sync` 
                          : "All Records Synchronized"}
                  </Typography>
                </View>

                {/* Control Action Buttons */}
                {!isSyncing && (
                  <View style={{ flexDirection: "row", gap: 10, marginTop: SPACING.sm }}>
                    {pendingCount > 0 && (
                      <Button 
                        label="Sync Now" 
                        onPress={() => syncNow(queryClient)} 
                        style={{ flex: 1 }} 
                      />
                    )}
                    {failedCount > 0 && (
                      <>
                        <Button 
                          label="Retry" 
                          onPress={() => retryFailed(queryClient)} 
                          style={{ flex: 1 }} 
                        />
                        <Button 
                          label="Clear" 
                          variant="outline" 
                          onPress={clearFailed} 
                          style={{ flex: 1 }} 
                        />
                      </>
                    )}
                  </View>
                )}
              </Surface>

              {/* 1. Pending Sync Items */}
              {pendingTxs.filter(t => t.status === "pending").length > 0 && (
                <View style={{ marginTop: SPACING.lg }}>
                  <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
                    PENDING TRANSACTIONS
                  </Typography>
                  {pendingTxs.filter(t => t.status === "pending").map((t) => (
                    <Surface key={t.localId} variant="elevated" padding="md" style={styles.syncItemRow}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="700" color={COLORS.white}>
                          {t.type.toUpperCase()}: {t.payload.playerName || "Card"}
                        </Typography>
                        <Typography variant="caption" color={COLORS.zinc500}>
                          Saved offline: {new Date(t.createdAt).toLocaleTimeString()}
                        </Typography>
                      </View>
                      <View style={styles.pendingBadge}>
                        <Typography variant="caption" weight="800" color={COLORS.warning}>PENDING</Typography>
                      </View>
                    </Surface>
                  ))}
                </View>
              )}

              {pendingExps.filter(e => e.status === "pending").length > 0 && (
                <View style={{ marginTop: SPACING.lg }}>
                  <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
                    PENDING EXPENSES
                  </Typography>
                  {pendingExps.filter(e => e.status === "pending").map((e) => (
                    <Surface key={e.localId} variant="elevated" padding="md" style={styles.syncItemRow}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="700" color={COLORS.white}>
                          Expense: {e.payload.category} - ${e.payload.amount}
                        </Typography>
                        <Typography variant="caption" color={COLORS.zinc500}>
                          Saved offline: {new Date(e.createdAt).toLocaleTimeString()}
                        </Typography>
                      </View>
                      <View style={styles.pendingBadge}>
                        <Typography variant="caption" weight="800" color={COLORS.warning}>PENDING</Typography>
                      </View>
                    </Surface>
                  ))}
                </View>
              )}

              {/* 2. Failed Sync Items */}
              {(pendingTxs.some(t => t.status === "failed") || pendingExps.some(e => e.status === "failed")) && (
                <View style={{ marginTop: SPACING.lg }}>
                  <Typography variant="label" color={COLORS.destructive} style={{ marginBottom: SPACING.sm }}>
                    FAILED SYNC ENTRIES
                  </Typography>
                  {pendingTxs.filter(t => t.status === "failed").map((t) => (
                    <Surface key={t.localId} variant="elevated" padding="md" style={[styles.syncItemRow, { borderColor: "rgba(224, 0, 28, 0.3)", borderWidth: 1 }]}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="700" color={COLORS.white}>
                          {t.type.toUpperCase()}: {t.payload.playerName || "Card"}
                        </Typography>
                        <Typography variant="caption" color={COLORS.destructive} style={{ marginTop: 4 }}>
                          Error: {t.error}
                        </Typography>
                      </View>
                    </Surface>
                  ))}
                  {pendingExps.filter(e => e.status === "failed").map((e) => (
                    <Surface key={e.localId} variant="elevated" padding="md" style={[styles.syncItemRow, { borderColor: "rgba(224, 0, 28, 0.3)", borderWidth: 1 }]}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="700" color={COLORS.white}>
                          Expense: {e.payload.category} - ${e.payload.amount}
                        </Typography>
                        <Typography variant="caption" color={COLORS.destructive} style={{ marginTop: 4 }}>
                          Error: {e.error}
                        </Typography>
                      </View>
                    </Surface>
                  ))}
                </View>
              )}

              {/* 3. Sync History Log */}
              {syncedItems.length > 0 && (
                <View style={{ marginTop: SPACING.xl }}>
                  <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
                    SYNCHRONIZATION HISTORY
                  </Typography>
                  {syncedItems.map((item) => (
                    <Surface key={item.localId} variant="glass" padding="md" style={styles.syncItemRow}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="600" color={COLORS.white}>
                          {item.description}
                        </Typography>
                        <Typography variant="caption" color={COLORS.zinc600}>
                          Synced: {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                      </View>
                      <View style={styles.successBadge}>
                        <Typography variant="caption" weight="800" color={COLORS.success}>SYNCED</Typography>
                      </View>
                    </Surface>
                  ))}
                </View>
              )}

              {pendingCount === 0 && failedCount === 0 && syncedItems.length === 0 && (
                <View style={{ alignItems: "center", paddingTop: 80 }}>
                  <Ionicons name="cloud-done-outline" size={48} color={COLORS.zinc600} />
                  <Typography variant="body" color={COLORS.zinc500} style={{ marginTop: 12 }}>
                    No sync records found
                  </Typography>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <CustomAlertModal
        visible={!!cardToDelete}
        title="Delete Card"
        message={`Are you sure you want to delete "${cardToDelete?.player_name || "this card"}" from your inventory? Comps and player info will remain saved.`}
        confirmText="Delete Card"
        cancelText="Cancel"
        iconName="trash-outline"
        variant="danger"
        onConfirm={async () => {
          if (!cardToDelete) return;
          try {
            await inventoryService.deleteItem(cardToDelete.id);
            queryClient.invalidateQueries();
          } catch (err: any) {
            console.error(err);
          } finally {
            setCardToDelete(null);
          }
        }}
        onCancel={() => setCardToDelete(null)}
      />
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
  actionRow: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: 20,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.zinc900,
    borderRadius: RADIUS.md,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: RADIUS.sm,
  },
  tabButtonActive: {
    backgroundColor: COLORS.zinc800,
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
  syncIconBtn: {
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.zinc900,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCount: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCloseBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  statusCard: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  syncItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  pendingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  successBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
});

// Export without error boundary for now
export default InventoryScreen;
