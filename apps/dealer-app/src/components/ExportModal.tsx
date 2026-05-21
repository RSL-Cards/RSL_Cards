import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

type ExportType = "transactions" | "inventory";

interface TimelineSuggestion {
  label: string;
  key: string;
  dateFrom: string;
  dateTo: string;
}

function getTimelineSuggestions(): TimelineSuggestion[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 7);

  const last30 = new Date(today);
  last30.setDate(last30.getDate() - 30);

  const last90 = new Date(today);
  last90.setDate(last90.getDate() - 90);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

  return [
    { label: "Last 7 Days", key: "7d", dateFrom: last7.toISOString(), dateTo: today.toISOString() },
    { label: "Last 30 Days", key: "30d", dateFrom: last30.toISOString(), dateTo: today.toISOString() },
    { label: "Last 90 Days", key: "90d", dateFrom: last90.toISOString(), dateTo: today.toISOString() },
    { label: "This Month", key: "this_month", dateFrom: thisMonthStart.toISOString(), dateTo: today.toISOString() },
    { label: "Last Month", key: "last_month", dateFrom: lastMonthStart.toISOString(), dateTo: lastMonthEnd.toISOString() },
    { label: "This Year", key: "this_year", dateFrom: thisYearStart.toISOString(), dateTo: today.toISOString() },
    { label: "Last Year", key: "last_year", dateFrom: lastYearStart.toISOString(), dateTo: lastYearEnd.toISOString() },
    { label: "All Time", key: "all", dateFrom: "", dateTo: "" },
  ];
}

// ─── Helpers ───

function safeFormatDate(val: any): string {
  if (!val) return "";
  // If it's already a string like "2026-05-20T18:00:00.000Z", parse it
  const str = typeof val === "string" ? val : String(val);
  // Try ISO parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  // Fallback: try to extract date portion from PG format "2026-05-20 18:00:00+05:30"
  const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[2]}/${match[3]}/${match[1]}`;
  }
  return str;
}

// ─── CSV Generators ───

function transactionsToCsv(rows: any[], periodLabel?: string): string {
  const now = new Date();
  const genDate = safeFormatDate(now.toISOString());
  const genTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // ── Company Header Block ──
  const brandHeader = [
    "RSL CARDS",
    "Run. Sell. Log. — Sports Card Dealer Platform",
    "",
    "REPORT:,Transaction History",
    `PERIOD:,${periodLabel ?? "All Time"}`,
    `GENERATED:,${genDate} at ${genTime}`,
    `TOTAL RECORDS:,${rows.length}`,
    "",
    "═══════════════════════════════════════════════════════",
    "",
  ];

  const headers = [
    "#",
    "Date",
    "Type",
    "Player Name",
    "Grade",
    "Channel",
    "Price ($)",
    "Cost Basis ($)",
    "Profit ($)",
    "Profit %",
    "Payment Method",
    "Deal Rating",
    "Comp at Time ($)",
  ];

  const lines = rows.map((r, i) => {
    const date = safeFormatDate(r.created_at);
    return [
      i + 1,
      date,
      (r.type ?? "").toUpperCase(),
      `"${(r.player_name ?? "").replace(/"/g, '""')}"`,
      r.grade_key ?? "RAW",
      r.channel ?? "",
      parseFloat(r.price ?? 0).toFixed(2),
      parseFloat(r.cost_basis ?? 0).toFixed(2),
      r.profit != null ? parseFloat(r.profit).toFixed(2) : "",
      r.profit_pct != null ? `${r.profit_pct}%` : "",
      r.payment_method ?? "",
      r.deal_rating ?? "",
      r.comp_price_at_time != null ? parseFloat(r.comp_price_at_time).toFixed(2) : "",
    ].join(",");
  });

  // ── Summary Footer ──
  const totalBuys = rows.filter((r) => r.type === "buy").length;
  const totalSells = rows.filter((r) => r.type === "sell").length;
  const totalSpent = rows.filter((r) => r.type === "buy").reduce((s, r) => s + parseFloat(r.price ?? 0), 0);
  const totalRevenue = rows.filter((r) => r.type === "sell").reduce((s, r) => s + parseFloat(r.price ?? 0), 0);
  const totalProfit = rows.filter((r) => r.type === "sell").reduce((s, r) => s + parseFloat(r.profit ?? 0), 0);
  const avgDealSize = rows.length > 0 ? (totalSpent + totalRevenue) / rows.length : 0;

  const summary = [
    "",
    "═══════════════════════════════════════════════════════",
    "",
    "FINANCIAL SUMMARY",
    "",
    `Metric,Value`,
    `Total Transactions,${rows.length}`,
    `Total Buys,${totalBuys}`,
    `Total Sells,${totalSells}`,
    `───────────────────,───────────`,
    `Total Spent (Buys),$${totalSpent.toFixed(2)}`,
    `Total Revenue (Sells),$${totalRevenue.toFixed(2)}`,
    `Total Profit,$${totalProfit.toFixed(2)}`,
    `Net Margin,${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0"}%`,
    `Avg Deal Size,$${avgDealSize.toFixed(2)}`,
    "",
    "───────────────────────────────────────────────────────",
    `© RSL Cards — Confidential`,
  ];

  return [...brandHeader, headers.join(","), ...lines, ...summary].join("\n");
}

function inventoryToCsv(rows: any[], periodLabel?: string): string {
  const now = new Date();
  const genDate = safeFormatDate(now.toISOString());
  const genTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // ── Company Header Block ──
  const brandHeader = [
    "RSL CARDS",
    "Run. Sell. Log. — Sports Card Dealer Platform",
    "",
    "REPORT:,Inventory Export",
    `PERIOD:,${periodLabel ?? "All Time"}`,
    `GENERATED:,${genDate} at ${genTime}`,
    `TOTAL RECORDS:,${rows.length}`,
    "",
    "═══════════════════════════════════════════════════════",
    "",
  ];

  const headers = [
    "#",
    "Player Name",
    "Year",
    "Set Name",
    "Variation",
    "Card #",
    "Sport",
    "Grade",
    "Cert #",
    "Cost Basis ($)",
    "Market Value ($)",
    "Unrealized Gain ($)",
    "Gain %",
    "Qty",
    "Status",
    "Consignment",
    "Notes",
    "Date Added",
  ];

  const lines = rows.map((r, i) => {
    const dateAdded = safeFormatDate(r.added_at);
    return [
      i + 1,
      `"${(r.player_name ?? "").replace(/"/g, '""')}"`,
      r.year ?? "",
      `"${(r.set_name ?? "").replace(/"/g, '""')}"`,
      `"${(r.variation ?? "").replace(/"/g, '""')}"`,
      r.card_number ?? "",
      r.sport ?? "",
      r.grade_key ?? "RAW",
      r.cert_number ?? "",
      parseFloat(r.cost_basis ?? 0).toFixed(2),
      r.current_market_value != null ? parseFloat(r.current_market_value).toFixed(2) : "",
      r.unrealized_gain != null ? parseFloat(r.unrealized_gain).toFixed(2) : "",
      r.gain_pct != null ? `${r.gain_pct}%` : "",
      r.quantity ?? 1,
      (r.listing_status ?? "unlisted").toUpperCase(),
      r.is_consignment ? `Yes — ${r.consignment_owner ?? ""}` : "No",
      `"${(r.notes ?? "").replace(/"/g, '""')}"`,
      dateAdded,
    ].join(",");
  });

  // ── Summary Footer ──
  const totalCards = rows.reduce((s, r) => s + (r.quantity ?? 1), 0);
  const totalCost = rows.reduce((s, r) => s + parseFloat(r.cost_basis ?? 0), 0);
  const totalMarket = rows.reduce((s, r) => s + parseFloat(r.current_market_value ?? 0), 0);
  const totalGain = totalMarket - totalCost;
  const unlisted = rows.filter((r) => r.listing_status === "unlisted").length;
  const listed = rows.filter((r) => r.listing_status === "listed").length;
  const sold = rows.filter((r) => r.listing_status === "sold").length;
  const avgCost = rows.length > 0 ? totalCost / rows.length : 0;

  const summary = [
    "",
    "═══════════════════════════════════════════════════════",
    "",
    "INVENTORY SUMMARY",
    "",
    `Metric,Value`,
    `Total Cards,${totalCards}`,
    `───────────────────,───────────`,
    `Total Cost Basis,$${totalCost.toFixed(2)}`,
    `Total Market Value,$${totalMarket.toFixed(2)}`,
    `Total Unrealized Gain,$${totalGain.toFixed(2)}`,
    `Gain %,${totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(1) : "0.0"}%`,
    `Avg Cost per Card,$${avgCost.toFixed(2)}`,
    `───────────────────,───────────`,
    `Unlisted,${unlisted}`,
    `Listed,${listed}`,
    `Sold,${sold}`,
    "",
    "───────────────────────────────────────────────────────",
    `© RSL Cards — Confidential`,
  ];

  return [...brandHeader, headers.join(","), ...lines, ...summary].join("\n");
}

// ─── Component ───

interface ExportModalProps {
  visible: boolean;
  type: ExportType;
  onClose: () => void;
}

export function ExportModal({ visible, type, onClose }: ExportModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>("30d");
  const [isExporting, setIsExporting] = useState(false);
  const suggestions = getTimelineSuggestions();
  const isTransactions = type === "transactions";

  const handleExport = useCallback(async () => {
    const suggestion = suggestions.find((s) => s.key === selectedKey);
    if (!suggestion) return;

    setIsExporting(true);
    try {
      const params: any = {};
      if (suggestion.dateFrom) params.dateFrom = suggestion.dateFrom;
      if (suggestion.dateTo) params.dateTo = suggestion.dateTo;

      const endpoint = isTransactions
        ? ENDPOINTS.transactions.export
        : ENDPOINTS.inventory.export;

      const { data } = await apiClient.get(endpoint, { params });
      const rows = data?.rows ?? [];

      if (rows.length === 0) {
        Toast.show({ type: "info", text1: "No data", text2: "No records found for the selected period." });
        setIsExporting(false);
        return;
      }

      const csv = isTransactions ? transactionsToCsv(rows, suggestion.label) : inventoryToCsv(rows, suggestion.label);

      const fileName = isTransactions
        ? `RSL_Transactions_${suggestion.key}_${Date.now()}.csv`
        : `RSL_Inventory_${suggestion.key}_${Date.now()}.csv`;

      const file = new File(Paths.cache, fileName);
      file.create();
      file.write(csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/csv",
          dialogTitle: `Share ${isTransactions ? "Transactions" : "Inventory"} CSV`,
          UTI: "public.comma-separated-values-text",
        });
      }

      Toast.show({
        type: "success",
        text1: "Export complete!",
        text2: `${rows.length} records exported as CSV.`,
      });
      onClose();
    } catch (err: any) {
      console.error("[EXPORT ERROR]", err);
      Toast.show({
        type: "error",
        text1: "Export failed",
        text2: err?.message ?? "Something went wrong.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedKey, isTransactions, onClose, suggestions]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: isTransactions ? "rgba(0,87,255,0.15)" : "rgba(0,200,83,0.15)" }]}>
              <Ionicons
                name={isTransactions ? "document-text" : "cube"}
                size={22}
                color={isTransactions ? "#0057FF" : "#00C853"}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.title}>
                Export {isTransactions ? "Transactions" : "Inventory"}
              </Text>
              <Text style={styles.subtitle}>
                {isTransactions
                  ? "All buys, sells, profit & loss"
                  : "Full inventory with cost, value & gain"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Timeline */}
          <Text style={styles.sectionLabel}>SELECT TIME PERIOD</Text>

          <ScrollView
            style={{ maxHeight: 320 }}
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((s) => {
              const active = selectedKey === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.timelineRow, active && styles.timelineRowActive]}
                  onPress={() => setSelectedKey(s.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>
                    {s.label}
                  </Text>
                  {s.key === "30d" && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={16} color="#0057FF" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.infoText}>
              {isTransactions
                ? "CSV includes date, type, player, grade, price, cost, profit, profit %, payment method, and summary totals."
                : "CSV includes player, year, set, grade, cost basis, market value, unrealized gain, gain %, status, and summary totals."}
            </Text>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[
              styles.exportBtn,
              { backgroundColor: isTransactions ? "#0057FF" : "#00C853" },
            ]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.85}
          >
            {isExporting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.exportBtnText}>
                  Export as CSV
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderBottomWidth: 0,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  timelineRowActive: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333",
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#0057FF",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0057FF",
  },
  timelineLabel: {
    color: "#AAA",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  timelineLabelActive: {
    color: "white",
  },
  recommendedBadge: {
    backgroundColor: "rgba(0,87,255,0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recommendedText: {
    color: "#0057FF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(0,87,255,0.08)",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  infoText: {
    color: "#888",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  exportBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  exportBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
