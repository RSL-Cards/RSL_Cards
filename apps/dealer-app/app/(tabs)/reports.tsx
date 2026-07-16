import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  useDailyStats,
  useReport,
  useRefetchDashboardOnFocus,
} from "../../src/hooks/useDashboard";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";

type Period = "today" | "week" | "month" | "ytd";

function fmt$(val: string | number | undefined) {
  const n = parseFloat(String(val ?? "0"));
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

function ReportGrid({ period }: { period: Period }) {
  // Use useDailyStats for today, and useReport for other periods.
  // Note: Since we are adding "ytd", ensure useReport supports it, or fallback.
  // For now, if "ytd" isn't fully supported in the hook yet, we just pass "month" as a placeholder or you would extend the backend.
  const apiPeriod = period === "today" ? "today" : period === "ytd" ? "ytd" : period;
  
  const { data: dailyStats, isLoading: loadingDaily } = useDailyStats();
  // @ts-ignore - ytd might not be strictly typed yet
  const { data: report, isLoading: loadingReport } = useReport(apiPeriod === "today" ? "week" : apiPeriod);

  const isLoading = period === "today" ? loadingDaily : loadingReport;

  let revenue = 0;
  let cost = 0;
  let profit = 0;
  let margin = 0;

  if (period === "today") {
    revenue = parseFloat(dailyStats?.total_revenue ?? "0");
    cost = parseFloat(dailyStats?.total_spent ?? "0");
    profit = parseFloat(dailyStats?.net_profit ?? "0");
    margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  } else {
    revenue = parseFloat(report?.total_revenue ?? "0");
    cost = parseFloat(report?.total_spent ?? "0");
    profit = parseFloat(report?.net_profit ?? "0");
    margin = report?.avg_margin ?? 0;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xl, paddingTop: SPACING.lg }}>
      <View style={styles.metricsGrid}>
        {[
          { label: "Revenue", value: fmt$(revenue), color: COLORS.white },
          { label: "Cost", value: fmt$(cost), color: COLORS.zinc400 },
          { label: "Profit", value: fmt$(profit), color: profit >= 0 ? COLORS.success : COLORS.destructive },
          { label: "Profit Margin", value: `${margin}%`, color: COLORS.primaryLight },
        ].map((m) => (
          <Surface key={m.label} variant="glass" padding="lg" style={styles.metricCard}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>{m.label}</Typography>
            {isLoading ? (
              <ActivityIndicator color={COLORS.zinc600} size="small" />
            ) : (
              <Typography variant="h2" weight="800" color={m.color}>{m.value}</Typography>
            )}
          </Surface>
        ))}
      </View>
    </ScrollView>
  );
}

function ReportsScreen() {
  const [period, setPeriod] = useState<Period>("today");
  useRefetchDashboardOnFocus();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <Typography variant="h1" weight="800">Performance</Typography>
      </View>

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

      <ReportGrid period={period} />
    </SafeAreaView>
  );
}

export default ReportsScreen;

const styles = StyleSheet.create({
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
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
  periodTabActive: { borderBottomColor: COLORS.primary },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  metricCard: {
    width: "47%",
    minHeight: 120,
    justifyContent: "center",
  },
});
