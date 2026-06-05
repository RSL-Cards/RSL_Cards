import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  useDailyStats,
  useTodayActivity,
  useReport,
  useProfitByChannel,
  useRefetchDashboardOnFocus,
} from "../../src/hooks/useDashboard";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";

type Period = "today" | "week" | "month";

function fmt$(val: string | number | undefined) {
  const n = parseFloat(String(val ?? "0"));
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

function Skeleton() {
  return (
    <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.xs }}>
      <ActivityIndicator color={COLORS.zinc600} style={{ marginTop: 40 }} />
    </View>
  );
}

function safeDayLabel(day: string): string {
  const m = String(day).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${parseInt(m[2])}/${parseInt(m[3])}`;
  return "—";
}

function BarChart({ data }: { data: { day: string; revenue: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 100, marginTop: SPACING.md }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: "100%",
              height: Math.max((d.revenue / max) * 88, 4),
              backgroundColor: d.revenue > 0 ? COLORS.primary : COLORS.zinc800,
              borderRadius: RADIUS.sm,
            }}
          />
          <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 4, fontSize: 9 }}>
            {safeDayLabel(d.day)}
          </Typography>
        </View>
      ))}
    </View>
  );
}

function AiSummaryCard() {
  return (
    <Surface variant="elevated" style={styles.aiCard}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
        <Ionicons name="flash" size={16} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
        <Typography variant="label" color={COLORS.primaryLight}>
          AI SUMMARY
        </Typography>
      </View>
      <Typography variant="h3" weight="800" style={{ marginBottom: SPACING.xs }}>
        Keep stacking — your margins are solid
      </Typography>
      <Typography variant="body" color={COLORS.zinc400} style={{ lineHeight: 20 }}>
        AI-powered deal analysis coming soon. Your buying patterns and profit
        trends will be summarized here automatically.
      </Typography>
    </Surface>
  );
}

function TodayView() {
  const { data: stats, isLoading: loadingStats } = useDailyStats();
  const { data: activity, isLoading: loadingActivity } = useTodayActivity();

  const revenue = parseFloat(stats?.total_revenue ?? "0");
  const profit = parseFloat(stats?.net_profit ?? "0");
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xl }}>
      <View style={styles.metricsRow}>
        {[
          { label: "Bought", value: String(stats?.cards_bought ?? 0), unit: "cards", color: COLORS.primaryLight },
          { label: "Sold", value: String(stats?.cards_sold ?? 0), unit: "cards", color: COLORS.destructive },
          { label: "Spent", value: fmt$(stats?.total_spent), unit: "", color: COLORS.zinc400 },
          { label: "Revenue", value: fmt$(stats?.total_revenue), unit: "", color: COLORS.white },
          { label: "Profit", value: fmt$(stats?.net_profit), unit: "", color: COLORS.success },
          { label: "Margin", value: `${margin}%`, unit: "", color: COLORS.primaryLight },
        ].map((m) => (
          <Surface key={m.label} variant="glass" padding="md" style={styles.metricCard}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.xs }}>{m.label}</Typography>
            {loadingStats ? (
              <ActivityIndicator color={COLORS.zinc600} size="small" />
            ) : (
              <Typography variant="h3" weight="800" color={m.color}>{m.value}</Typography>
            )}
            {m.unit ? <Typography variant="caption" color={COLORS.zinc500}>{m.unit}</Typography> : null}
          </Surface>
        ))}
      </View>

      <Typography variant="label" color={COLORS.zinc500} style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, marginBottom: SPACING.md }}>
        LAST 24H TRANSACTIONS
      </Typography>

      {loadingActivity ? (
        <Skeleton />
      ) : !activity?.length ? (
        <View style={{ marginHorizontal: SPACING.lg, padding: SPACING.xl, alignItems: "center" }}>
          <Typography variant="body" color={COLORS.zinc500}>No transactions yet today</Typography>
        </View>
      ) : (
        <Surface variant="elevated" padding="none" style={styles.card}>
          {activity.map((tx, i) => (
            <View key={tx.id} style={[styles.txRow, i < activity.length - 1 && styles.txDivider]}>
              {tx.imageUrl ? (
                <View style={[styles.typeBadge, { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden', backgroundColor: COLORS.zinc800 }]}>
                  <Image source={{ uri: tx.imageUrl }} style={{ width: 44, height: 44, resizeMode: 'cover' }} />
                </View>
              ) : (
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: tx.type === "buy" ? 'rgba(79,70,229,0.15)' : 'rgba(225,29,72,0.15)' },
                  ]}
                >
                  <Typography variant="body" weight="800" color={tx.type === "buy" ? COLORS.primaryLight : COLORS.destructive}>
                    {tx.type === "buy" ? "B" : tx.type === "sell" ? "S" : "T"}
                  </Typography>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Typography variant="body" weight="600" numberOfLines={1}>{tx.playerName}</Typography>
                <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 2 }}>{tx.time}</Typography>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Typography variant="body" weight="700">
                  ${parseFloat(tx.price).toFixed(0)}
                </Typography>
                {tx.profit != null && (
                  <Typography variant="caption" weight="600" color={parseFloat(tx.profit) >= 0 ? COLORS.success : COLORS.destructive} style={{ marginTop: 2 }}>
                    {parseFloat(tx.profit) >= 0 ? "+" : ""}${parseFloat(tx.profit).toFixed(0)}
                  </Typography>
                )}
              </View>
            </View>
          ))}
        </Surface>
      )}

      <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
        <AiSummaryCard />
      </View>
    </ScrollView>
  );
}

function PeriodView({ period }: { period: "week" | "month" }) {
  const { data: report, isLoading: loadingReport } = useReport(period);
  const { data: channelData, isLoading: loadingChannel } =
    useProfitByChannel(period);

  const maxChannel = Math.max(
    ...(channelData?.channels ?? []).map((c) => c.revenue),
    1,
  );
  const label = period === "week" ? "7 DAYS" : "30 DAYS";

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xl }}>
      {/* Metrics */}
      <View style={styles.metricsRow}>
        {[
          { label: "Revenue", value: fmt$(report?.total_revenue), color: COLORS.white },
          { label: "Profit", value: fmt$(report?.net_profit), color: COLORS.success },
          { label: "Margin", value: `${report?.avg_margin ?? 0}%`, color: COLORS.primaryLight },
        ].map((m) => (
          <Surface key={m.label} variant="glass" padding="md" style={styles.metricCard}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.xs }}>{m.label}</Typography>
            {loadingReport ? (
              <ActivityIndicator color={COLORS.zinc600} size="small" />
            ) : (
              <Typography variant="h3" weight="800" color={m.color}>{m.value}</Typography>
            )}
          </Surface>
        ))}
      </View>

      {/* Cards count row */}
      <View style={[styles.metricsRow, { marginTop: SPACING.sm }]}>
        {[
          { label: "Bought", value: String(report?.cards_bought ?? 0), color: COLORS.primaryLight },
          { label: "Sold", value: String(report?.cards_sold ?? 0), color: COLORS.destructive },
          { label: "Spent", value: fmt$(report?.total_spent), color: COLORS.zinc400 },
        ].map((m) => (
          <Surface key={m.label} variant="glass" padding="md" style={styles.metricCard}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.xs }}>{m.label}</Typography>
            {loadingReport ? (
              <ActivityIndicator color={COLORS.zinc600} size="small" />
            ) : (
              <Typography variant="h3" weight="800" color={m.color}>{m.value}</Typography>
            )}
          </Surface>
        ))}
      </View>

      {/* Bar chart */}
      {!loadingReport && !!report?.daily_revenue?.length && (
        <Surface variant="elevated" padding="lg" style={[styles.card, { marginTop: SPACING.lg }]}>
          <Typography variant="label" color={COLORS.zinc500}>DAILY REVENUE — {label}</Typography>
          <BarChart data={report.daily_revenue} />
        </Surface>
      )}

      {/* Best deal */}
      {!loadingReport && report?.best_deal && (
        <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.lg }}>
          <Surface
            variant="elevated"
            padding="lg"
            style={[styles.card, { borderLeftWidth: 3, borderLeftColor: "#FFD700", marginHorizontal: 0 }]}
          >
            <Typography variant="label" color={COLORS.zinc500}>BEST DEAL — {label}</Typography>
            <Typography variant="h3" weight="700" color={COLORS.white} style={{ marginTop: SPACING.xs }}>
              {report.best_deal.player}
            </Typography>
            <Typography variant="h3" weight="900" color={COLORS.success} style={{ marginTop: 4 }}>
              +${parseFloat(report.best_deal.profit).toFixed(0)} · {report.best_deal.margin}% margin
            </Typography>
          </Surface>
        </View>
      )}

      {/* Channel breakdown */}
      <Typography variant="label" color={COLORS.zinc500} style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, marginBottom: SPACING.md }}>
        REVENUE BY CHANNEL
      </Typography>
      {loadingChannel ? (
        <Skeleton />
      ) : !channelData?.channels?.length ? (
        <View style={{ marginHorizontal: SPACING.lg, padding: SPACING.lg, alignItems: "center" }}>
          <Typography variant="body" color={COLORS.zinc500}>No sales data for this period</Typography>
        </View>
      ) : (
        <Surface variant="elevated" padding="none" style={styles.card}>
          {channelData.channels.map((c, i) => (
            <View key={c.channel} style={[{ padding: SPACING.md }, i < channelData.channels.length - 1 && styles.txDivider]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.sm }}>
                <Typography variant="body" weight="600" style={{ textTransform: "capitalize" }}>
                  {c.channel.replace(/_/g, " ")}
                </Typography>
                <View style={{ alignItems: "flex-end" }}>
                  <Typography variant="body" weight="700">{fmt$(c.revenue)}</Typography>
                  {c.profit > 0 && (
                    <Typography variant="caption" color={COLORS.success} style={{ marginTop: 2 }}>
                      +{fmt$(c.profit)} profit
                    </Typography>
                  )}
                </View>
              </View>
              <View style={{ height: 4, backgroundColor: COLORS.zinc800, borderRadius: 2 }}>
                <View style={{ height: 4, width: `${(c.revenue / maxChannel) * 100}%`, backgroundColor: COLORS.primaryLight, borderRadius: 2 }} />
              </View>
            </View>
          ))}
        </Surface>
      )}
    </ScrollView>
  );
}

function ReportsScreen() {
  const [period, setPeriod] = useState<Period>("today");
  useRefetchDashboardOnFocus();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <Typography variant="h1" weight="800">Reports</Typography>
      </View>

      <View style={styles.periodTabs}>
        {(["today", "week", "month"] as Period[]).map((p) => (
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
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {period === "today" && <TodayView />}
      {period === "week" && <PeriodView period="week" />}
      {period === "month" && <PeriodView period="month" />}
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
    marginBottom: SPACING.md,
  },
  periodTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  periodTabActive: { borderBottomColor: COLORS.primary },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: 4,
  },
  metricCard: {
    flex: 1,
    minWidth: 80,
  },
  card: {
    marginHorizontal: SPACING.lg,
  },
  txRow: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.md, paddingHorizontal: SPACING.md },
  txDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  typeBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: "center",
  },
  aiCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
});
