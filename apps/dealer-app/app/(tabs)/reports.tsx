import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../src/lib/apiClient";
import { useAuthStore } from "../../src/stores/authStore";
import {
  useDailyStats,
  useReport,
  useDailyLogs,
  useDailyLogTransactions,
  useRefetchDashboardOnFocus,
  DailyLog,
} from "../../src/hooks/useDashboard";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";
import { Button } from "../../src/components/ui/Button";
import RSLLoader from "../../src/components/RSLLoader";
import { router } from "expo-router";
import { EditTransactionModal, TransactionToEdit } from "../../src/components/ui/EditTransactionModal";

type Period = "today" | "week" | "month" | "ytd";
type TopTab = "performance" | "logs";

function fmt$(val: string | number | undefined) {
  const n = parseFloat(String(val ?? "0"));
  return `$${n.toFixed(2)}`;
}

function fmtDate(dateVal: any, includeTime: boolean = true) {
  if (!dateVal) return "—";
  try {
    let d: Date;
    if (dateVal instanceof Date) {
      d = dateVal;
    } else {
      let cleaned = String(dateVal).trim();
      if (cleaned.includes(" ") && !cleaned.includes("T")) {
        cleaned = cleaned.replace(" ", "T");
      }
      if (cleaned.match(/[+-]\d{2}$/)) {
        cleaned = cleaned + ":00";
      }
      d = new Date(cleaned);
    }

    if (isNaN(d.getTime())) {
      return String(dateVal);
    }
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const datePart = `${day} ${month}, ${year}`;
    if (includeTime) {
      const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${datePart}, ${timePart}`;
    }
    return datePart;
  } catch (e) {
    return String(dateVal);
  }
}

function fmtTime(dateVal: any) {
  if (!dateVal) return "—";
  try {
    let d: Date;
    if (dateVal instanceof Date) {
      d = dateVal;
    } else {
      let cleaned = String(dateVal).trim();
      if (cleaned.includes(" ") && !cleaned.includes("T")) {
        cleaned = cleaned.replace(" ", "T");
      }
      if (cleaned.match(/[+-]\d{2}$/)) {
        cleaned = cleaned + ":00";
      }
      d = new Date(cleaned);
    }

    if (isNaN(d.getTime())) {
      return String(dateVal);
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return String(dateVal);
  }
}

function PerformanceTab({ period }: { period: Period }) {
  const userId = useAuthStore((s) => s.user?.id);
  const apiPeriod = period === "today" ? "today" : period === "ytd" ? "ytd" : period;
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);
  
  const { data: dailyStats, isLoading: loadingDaily } = useDailyStats();
  const { data: report, isLoading: loadingReport } = useReport(apiPeriod === "today" ? "week" : apiPeriod);

  const isLoading = period === "today" ? loadingDaily : loadingReport;

  let revenue = 0;
  let purchases = 0;
  let costOfCardsSold = 0;
  let expenses = 0;
  let profit = 0;
  let margin = 0;
  let inventoryCost = 0;

  if (period === "today") {
    revenue = parseFloat(dailyStats?.total_revenue ?? "0");
    purchases = parseFloat(dailyStats?.total_spent ?? "0");
    costOfCardsSold = parseFloat(dailyStats?.cost_of_cards_sold ?? "0");
    expenses = parseFloat(dailyStats?.expenses ?? "0");
    profit = parseFloat(dailyStats?.net_profit ?? "0");
    margin = dailyStats?.avg_margin ?? 0;
    inventoryCost = parseFloat(dailyStats?.current_inventory_cost_basis ?? "0");
  } else {
    revenue = parseFloat(report?.total_revenue ?? "0");
    purchases = parseFloat(report?.total_spent ?? "0");
    costOfCardsSold = parseFloat(report?.cost_of_cards_sold ?? "0");
    expenses = parseFloat(report?.expenses ?? "0");
    profit = parseFloat(report?.net_profit ?? "0");
    margin = report?.avg_margin ?? 0;
    inventoryCost = parseFloat(report?.current_inventory_cost_basis ?? "0");
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Hero Card: Net Profit */}
      <Surface variant="glass" padding="lg" style={styles.heroCard}>
        <Typography variant="label" color={COLORS.zinc400} style={{ marginBottom: 4 }}>
          Net Profit
        </Typography>
        {isLoading ? (
          <RSLLoader size={28} />
        ) : (
          <Typography variant="h1" weight="900" color={profit >= 0 ? COLORS.success : COLORS.destructive}>
            {fmt$(profit)}
          </Typography>
        )}
      </Surface>

      {/* Grid of Other Financial Metrics */}
      <View style={styles.metricsGrid}>
        {[
          { label: "Revenue", value: fmt$(revenue), color: COLORS.white },
          { label: "Profit Margin", value: `${margin.toFixed(1)}%`, color: COLORS.primaryLight },
          { label: "Purchases", value: fmt$(purchases), color: COLORS.zinc300 },
          { label: "Cost of Cards Sold", value: fmt$(costOfCardsSold), color: COLORS.zinc400 },
          { label: "Expenses", value: fmt$(expenses), color: COLORS.destructive },
          { label: "Remaining Inventory Cost Basis", value: fmt$(inventoryCost), color: COLORS.white },
        ].map((m) => (
          <Surface key={m.label} variant="glass" padding="md" style={styles.metricCard}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: 4, fontSize: 11 }}>
              {m.label}
            </Typography>
            {isLoading ? (
              <ActivityIndicator color={COLORS.zinc600} size="small" />
            ) : (
              <Typography variant="h3" weight="800" color={m.color}>
                {m.value}
              </Typography>
            )}
          </Surface>
        ))}
      </View>
    </ScrollView>
  );
}

function DailyLogsTab() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: logs, isLoading, refetch } = useDailyLogs();
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  
  // Modals
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionToEdit | null>(null);
  
  // Edit form states
  const [editName, setEditName] = useState("");
  const [editStartingCash, setEditStartingCash] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isClosingLog, setIsClosingLog] = useState(false);

  // Transactions list query
  const { data: logTransactions = [], refetch: refetchTxs } = useDailyLogTransactions(selectedLog?.id || null);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.status && l.status.toLowerCase().includes(q))
    );
  }, [logs, searchQuery]);

  const openLogs = useMemo(() => filteredLogs.filter((l) => l.status === "open"), [filteredLogs]);
  const closedLogs = useMemo(() => filteredLogs.filter((l) => l.status === "closed"), [filteredLogs]);

  const handleOpenDetails = (log: DailyLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleOpenEdit = (log: DailyLog) => {
    setSelectedLog(log);
    setEditName(log.name);
    setEditStartingCash(log.startingCash ? String(log.startingCash) : "");
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedLog) return;
    if (!editName.trim()) {
      Alert.alert("Error", "Daily log name cannot be empty.");
      return;
    }
    setIsSavingEdit(true);
    try {
      await apiClient.patch(`/v1/daily-logs/${selectedLog.id}`, {
        name: editName,
        startingCash: editStartingCash ? parseFloat(editStartingCash) : 0,
      });
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "list", userId] });
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "active", userId] });
      refetch();
      setShowEdit(false);
      Alert.alert("Success", "Daily log updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update daily log.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCloseDailyLog = async () => {
    if (!selectedLog) return;
    setIsClosingLog(true);
    try {
      await apiClient.patch(`/v1/daily-logs/${selectedLog.id}/close`);
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "list", userId] });
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "active", userId] });
      refetch();
      
      const updatedLog = {
        ...selectedLog,
        status: "closed" as const,
        closedAt: new Date().toISOString(),
      };
      setSelectedLog(updatedLog);
      
      Alert.alert("Success", "Daily log closed successfully.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to close daily log.");
    } finally {
      setIsClosingLog(false);
    }
  };

  const handleDeleteItem = (itemId: string, type: "buy" | "sell" | "trade" | "expense") => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This will permanently remove it and automatically recalculate all daily log totals.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (type === "expense") {
                await apiClient.delete(`/v1/analytics/expenses/${itemId}`);
              } else {
                await apiClient.delete(`/v1/transactions/${itemId}`);
              }

              // Invalidate log metrics and transactions feed
              await queryClient.invalidateQueries({ queryKey: ["daily-logs", "list", userId] });
              await queryClient.invalidateQueries({ queryKey: ["daily-logs", "active", userId] });
              await queryClient.invalidateQueries({ queryKey: ["analytics", "daily", userId] });
              await queryClient.invalidateQueries({ queryKey: ["analytics", "report", "week", userId] });
              await queryClient.invalidateQueries({ queryKey: ["analytics", "report", "month", userId] });
              
              refetchTxs();
              refetch().then(({ data }) => {
                const refreshed = data?.find(d => d.id === selectedLog?.id);
                if (refreshed) setSelectedLog(refreshed);
              });

              Alert.alert("Deleted", "Entry deleted and daily stats updated.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete item.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.zinc500} style={styles.searchIcon} />
        <TextInput
          placeholder="Search logs by name or event..."
          placeholderTextColor={COLORS.zinc500}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.logsListContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {isLoading ? (
          <RSLLoader size={36} />
        ) : (
          <>
            {/* Open Logs Section */}
            {openLogs.length > 0 && (
              <View style={styles.section}>
                <Typography variant="label" color={COLORS.zinc400} style={styles.sectionHeader}>
                  Open Logs ({openLogs.length})
                </Typography>
                {openLogs.map((log) => (
                  <TouchableOpacity key={log.id} style={styles.logCard} onPress={() => handleOpenDetails(log)}>
                    <Surface variant="glass" padding="md" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Typography variant="body" weight="700" color={COLORS.white}>{log.name}</Typography>
                        <Typography variant="caption" color={COLORS.zinc400}>
                          Opened {fmtDate(log.createdAt, false)}
                        </Typography>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 2 }}>
                        <Typography variant="body" weight="800" color={COLORS.success}>
                          {fmt$(log.stats.profit)}
                        </Typography>
                        <Typography variant="caption" color={COLORS.zinc500}>Open</Typography>
                      </View>
                    </Surface>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Closed Logs Section */}
            <View style={[styles.section, { marginTop: SPACING.md }]}>
              <Typography variant="label" color={COLORS.zinc400} style={styles.sectionHeader}>
                Closed Logs ({closedLogs.length})
              </Typography>
              {closedLogs.length === 0 && openLogs.length === 0 ? (
                <Surface variant="glass" padding="lg" style={{ alignItems: "center" }}>
                  <Typography variant="body" color={COLORS.zinc500}>No logs found.</Typography>
                </Surface>
              ) : (
                closedLogs.map((log) => (
                  <TouchableOpacity key={log.id} style={styles.logCard} onPress={() => handleOpenDetails(log)}>
                    <Surface variant="glass" padding="md" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Typography variant="body" weight="700" color={COLORS.white}>{log.name}</Typography>
                          {log.updatedAfterClosing && (
                            <View style={styles.updatedBadge}>
                              <Typography variant="caption" weight="800" style={{ fontSize: 9, color: "#FFB300" }}>
                                UPDATED
                              </Typography>
                            </View>
                          )}
                        </View>
                        <Typography variant="caption" color={COLORS.zinc400}>
                          {fmtDate(log.createdAt, false)}
                        </Typography>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 2 }}>
                        <Typography variant="body" weight="800" color={parseFloat(log.stats.profit) >= 0 ? COLORS.success : COLORS.destructive}>
                          {fmt$(log.stats.profit)}
                        </Typography>
                        <Typography variant="caption" color={COLORS.zinc500}>Closed</Typography>
                      </View>
                    </Surface>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Log Details Modal */}
      <Modal visible={showDetails} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDetails(false)}>
        <SafeAreaView style={styles.modalContainer}>
          {selectedLog && (
            <>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDetails(false)}>
                  <Typography variant="body" color={COLORS.zinc400}>Close</Typography>
                </TouchableOpacity>
                <Typography variant="h3" weight="800" color={COLORS.white} style={{ maxWidth: "60%" }} numberOfLines={1}>
                  {selectedLog.name}
                </Typography>
                <TouchableOpacity onPress={() => handleOpenEdit(selectedLog)}>
                  <Typography variant="body" color={COLORS.primaryLight}>Edit</Typography>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Meta details */}
                <Surface variant="elevated" padding="md" style={{ gap: 4, marginBottom: SPACING.md }}>
                  <View style={styles.metaRow}>
                    <Typography variant="caption" color={COLORS.zinc400}>Opened</Typography>
                    <Typography variant="body" color={COLORS.white}>
                      {fmtDate(selectedLog.createdAt)}
                    </Typography>
                  </View>
                  {selectedLog.closedAt && (
                    <View style={styles.metaRow}>
                      <Typography variant="caption" color={COLORS.zinc400}>Closed</Typography>
                      <Typography variant="body" color={COLORS.white}>
                        {fmtDate(selectedLog.closedAt)}
                      </Typography>
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <Typography variant="caption" color={COLORS.zinc400}>Status</Typography>
                    <Typography variant="body" weight="700" color={selectedLog.status === "open" ? COLORS.success : COLORS.zinc400}>
                      {selectedLog.status.toUpperCase()}
                    </Typography>
                  </View>
                  {selectedLog.updatedAfterClosing && (
                    <View style={styles.metaRow}>
                      <Typography variant="caption" color="#FFB300">Edited After Close</Typography>
                      <Typography variant="body" weight="700" color="#FFB300">YES</Typography>
                    </View>
                  )}
                </Surface>

                {/* Financial Summary */}
                <Typography variant="label" color={COLORS.zinc400} style={styles.modalSubheading}>
                  FINANCIAL SUMMARY
                </Typography>
                <View style={styles.financialStatsGrid}>
                  {[
                    { label: "Starting Cash", value: fmt$(selectedLog.startingCash) },
                    { label: "Revenue", value: fmt$(selectedLog.stats.revenue) },
                    { label: "Purchases", value: fmt$(selectedLog.stats.purchases) },
                    { label: "Cost of Cards Sold", value: fmt$(selectedLog.stats.costOfCardsSold) },
                    { label: "Expenses", value: fmt$(selectedLog.stats.expenses) },
                    { label: "Net Profit", value: fmt$(selectedLog.stats.profit), highlight: true },
                    { label: "Margin", value: `${selectedLog.stats.profitMargin}%` },
                    { label: "Expected End Cash", value: fmt$(selectedLog.stats.expectedEndingCash) },
                  ].map((s) => (
                    <Surface key={s.label} variant="glass" padding="sm" style={styles.modalStatCard}>
                      <Typography variant="caption" color={COLORS.zinc500} style={{ fontSize: 10 }}>{s.label}</Typography>
                      <Typography variant="body" weight="800" color={s.highlight ? (parseFloat(selectedLog.stats.profit) >= 0 ? COLORS.success : COLORS.destructive) : COLORS.white}>
                        {s.value}
                      </Typography>
                    </Surface>
                  ))}
                </View>

                {/* Log stats */}
                <Typography variant="label" color={COLORS.zinc400} style={styles.modalSubheading}>
                  ACTIVITY COUNTERS
                </Typography>
                <View style={[styles.metaRow, { paddingHorizontal: SPACING.sm, marginBottom: SPACING.md }]}>
                  <Typography variant="body" color={COLORS.zinc300}>Cards Bought: {selectedLog.stats.cardsBought}</Typography>
                  <Typography variant="body" color={COLORS.zinc300}>Cards Sold: {selectedLog.stats.cardsSold}</Typography>
                  <Typography variant="body" color={COLORS.zinc300}>Trades: {selectedLog.stats.trades}</Typography>
                </View>

                {/* Transactions Feed */}
                <Typography variant="label" color={COLORS.zinc400} style={styles.modalSubheading}>
                  LOG TRANSACTION FEED
                </Typography>
                {logTransactions.length === 0 ? (
                  <Surface variant="glass" padding="md" style={{ alignItems: "center" }}>
                    <Typography variant="body" color={COLORS.zinc500}>No entries recorded in this daily log.</Typography>
                  </Surface>
                ) : (
                  logTransactions.map((tx: any) => {
                    const isExpense = tx.type === "expense";
                    const isSell = tx.type === "sell";
                    const isTrade = tx.type === "trade";
                    const isBuy = tx.type === "buy";

                    const amtColor = isExpense
                      ? COLORS.destructive
                      : isSell
                      ? COLORS.success
                      : isTrade
                      ? "#00C853"
                      : COLORS.primaryLight;

                    const sign = isExpense ? "-" : isSell ? "+" : isBuy ? "-" : "";

                    let formattedAmountStr = `${sign}${fmt$(tx.amount)}`;
                    if (isTrade) {
                      const num = parseFloat(String(tx.amount || 0));
                      if (num > 0) formattedAmountStr = `+${fmt$(num)}`;
                      else if (num < 0) formattedAmountStr = `-${fmt$(Math.abs(num))}`;
                      else formattedAmountStr = "Straight Trade";
                    }

                    return (
                      <Surface key={tx.id} variant="glass" padding="md" style={styles.txRow}>
                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View
                              style={[
                                styles.txBadge,
                                {
                                  backgroundColor: isExpense
                                    ? "rgba(224, 0, 28, 0.15)"
                                    : isSell
                                    ? "rgba(0, 200, 83, 0.15)"
                                    : isTrade
                                    ? "rgba(0, 200, 83, 0.15)"
                                    : "rgba(33, 150, 243, 0.15)",
                                },
                              ]}
                            >
                              <Typography
                                variant="caption"
                                weight="800"
                                style={{
                                  fontSize: 9,
                                  color: isExpense
                                    ? COLORS.destructive
                                    : isSell
                                    ? COLORS.success
                                    : isTrade
                                    ? "#00C853"
                                    : COLORS.primaryLight,
                                }}
                              >
                                {isTrade ? "TRADE" : tx.type.toUpperCase()}
                              </Typography>
                            </View>
                            <Typography variant="caption" color={COLORS.zinc400}>
                              {fmtTime(tx.time)}
                            </Typography>
                          </View>
                          <Typography variant="body" weight="600" color={COLORS.white} numberOfLines={1}>
                            {tx.description || (isTrade ? "Trade Transaction" : "Transaction")}
                          </Typography>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
                          <Typography variant="body" weight="800" color={amtColor}>
                            {formattedAmountStr}
                          </Typography>
                          <TouchableOpacity
                            onPress={() =>
                              setEditingTx({
                                id: tx.id,
                                type: tx.type,
                                playerName: tx.description,
                                amount: tx.amount,
                                paymentMethod: tx.paymentMethod,
                                channel: tx.channel,
                              })
                            }
                            style={{ padding: 4 }}
                          >
                            <Ionicons name="pencil-outline" size={18} color="#FFB300" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteItem(tx.id, tx.type)} style={{ padding: 4 }}>
                            <Ionicons name="trash-outline" size={18} color={COLORS.destructive} />
                          </TouchableOpacity>
                        </View>
                      </Surface>
                    );
                  })
                )}

                {/* Close log button */}
                {selectedLog.status === "open" && (
                  <Button
                    label={isClosingLog ? "Closing..." : "Close Daily Log"}
                    onPress={handleCloseDailyLog}
                    variant="outline"
                    disabled={isClosingLog}
                    style={{ marginTop: SPACING.xl, borderColor: COLORS.destructive }}
                  />
                )}
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Edit Details Sub-Modal */}
      <Modal visible={showEdit} transparent animationType="fade" onRequestClose={() => setShowEdit(false)}>
        <TouchableOpacity style={styles.editBackdrop} activeOpacity={1} onPress={() => setShowEdit(false)}>
          <Surface variant="elevated" padding="lg" style={styles.editModalCard}>
            <Typography variant="h3" weight="800" color={COLORS.white} style={{ marginBottom: SPACING.md }}>
              Edit Log Details
            </Typography>

            <Typography variant="label" color={COLORS.zinc400} style={{ marginBottom: 4 }}>
              LOG NAME / EVENT
            </Typography>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Dallas Card Show"
              placeholderTextColor={COLORS.zinc500}
              style={styles.editInput}
            />

            <Typography variant="label" color={COLORS.zinc400} style={{ marginTop: SPACING.md, marginBottom: 4 }}>
              STARTING CASH
            </Typography>
            <TextInput
              value={editStartingCash}
              onChangeText={setEditStartingCash}
              placeholder="e.g. 500"
              placeholderTextColor={COLORS.zinc500}
              keyboardType="numeric"
              style={styles.editInput}
            />

            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setShowEdit(false)} style={styles.cancelBtn}>
                <Typography variant="body" color={COLORS.zinc400}>Cancel</Typography>
              </TouchableOpacity>
              <Button
                label={isSavingEdit ? "Saving..." : "Save Details"}
                onPress={handleSaveEdit}
                variant="primary"
                disabled={isSavingEdit}
                style={{ flex: 1 }}
              />
            </View>
          </Surface>
        </TouchableOpacity>
      </Modal>
      <EditTransactionModal
        visible={!!editingTx}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSuccess={() => {
          refetchTxs();
          refetch();
        }}
      />
    </View>
  );
}

function ReportsScreen() {
  const [topTab, setTopTab] = useState<TopTab>("performance");
  const [period, setPeriod] = useState<Period>("today");
  useRefetchDashboardOnFocus();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Typography variant="h1" weight="800">Reports</Typography>
          <Typography variant="caption" color={COLORS.zinc400}>
            {topTab === "performance" ? "Financial analytics & channel metrics" : "Daily logs & show transaction session history"}
          </Typography>
        </View>
      </View>

      {/* Top Selector Bar */}
      <View style={styles.topSelectorBar}>
        <TouchableOpacity
          style={[styles.topTabBtn, topTab === "performance" && styles.topTabBtnActive]}
          onPress={() => setTopTab("performance")}
        >
          <Typography variant="body" weight="700" color={topTab === "performance" ? COLORS.white : COLORS.zinc500}>
            Performance
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTabBtn, topTab === "logs" && styles.topTabBtnActive]}
          onPress={() => setTopTab("logs")}
        >
          <Typography variant="body" weight="700" color={topTab === "logs" ? COLORS.white : COLORS.zinc500}>
            Daily Logs
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Period Tabs (Only for Performance view) */}
      {topTab === "performance" && (
        <View style={styles.periodTabs}>
          {(["today", "week", "month", "ytd"] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodTab, period === p && styles.periodTabActive]}
              onPress={() => setPeriod(p)}
            >
              <Typography
                variant="body"
                weight={period === p ? "700" : "600"}
                color={period === p ? COLORS.white : COLORS.zinc500}
              >
                {p === "today" ? "Today" : p === "week" ? "7 Days" : p === "month" ? "30 Days" : "YTD"}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {topTab === "performance" ? <PerformanceTab period={period} /> : <DailyLogsTab />}
    </SafeAreaView>
  );
}

export default ReportsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  topSelectorBar: {
    flexDirection: "row",
    backgroundColor: COLORS.zinc900,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topTabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    borderRadius: RADIUS.sm,
  },
  topTabBtnActive: {
    backgroundColor: COLORS.zinc800,
  },
  periodTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
  periodTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  periodTabActive: {
    borderBottomColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    backgroundColor: "rgba(30, 30, 30, 0.45)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  metricCard: {
    width: "47%",
    minHeight: 90,
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.zinc900,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
  },
  logsListContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
    fontSize: 12,
  },
  logCard: {
    marginBottom: SPACING.sm,
  },
  updatedBadge: {
    backgroundColor: "rgba(255, 179, 0, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 179, 0, 0.3)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalScroll: {
    padding: SPACING.lg,
  },
  modalSubheading: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  financialStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalStatCard: {
    width: "48%",
    minHeight: 64,
    justifyContent: "center",
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  txBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  editBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  editModalCard: {
    width: "100%",
    backgroundColor: COLORS.zinc900,
    borderRadius: RADIUS.lg,
  },
  editInput: {
    backgroundColor: COLORS.zinc800,
    color: COLORS.white,
    height: 48,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
  },
});
