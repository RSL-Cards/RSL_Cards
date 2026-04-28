import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  useDailyStats,
  useTodayActivity,
  useReport,
  useProfitByChannel,
  useRefetchDashboardOnFocus,
} from "../../src/hooks/useDashboard";

type Period = "today" | "week" | "month";

function fmt$(val: string | number | undefined) {
  const n = parseFloat(String(val ?? "0"));
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

function Skeleton() {
  return (
    <View style={{ marginHorizontal: 20, marginTop: 4 }}>
      <ActivityIndicator color="#333333" style={{ marginTop: 40 }} />
    </View>
  );
}

function safeDayLabel(day: string): string {
  // Handles: "2026-04-27", "2026-04-27T00:00:00.000Z", "2026-04-27 00:00:00+00"
  const m = String(day).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${parseInt(m[2])}/${parseInt(m[3])}`;
  return "—";
}

function BarChart({ data }: { data: { day: string; revenue: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 6,
        height: 100,
        marginTop: 12,
      }}
    >
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: "100%",
              height: Math.max((d.revenue / max) * 88, 4),
              backgroundColor: d.revenue > 0 ? "#0057FF" : "#1A1A1A",
              borderRadius: 4,
            }}
          />
          <Text style={{ color: "#555555", fontSize: 9, marginTop: 4 }}>
            {safeDayLabel(d.day)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function AiSummaryCard() {
  return (
    <View style={styles.aiCard}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Text style={{ fontSize: 16, marginRight: 8 }}>⚡</Text>
        <Text
          style={{
            color: "#E8001C",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,
          }}
        >
          AI SUMMARY
        </Text>
      </View>
      <Text
        style={{
          color: "white",
          fontSize: 15,
          fontWeight: "700",
          marginBottom: 6,
        }}
      >
        Keep stacking — your margins are solid
      </Text>
      <Text style={{ color: "#888888", fontSize: 13, lineHeight: 19 }}>
        AI-powered deal analysis coming soon. Your buying patterns and profit
        trends will be summarized here automatically.
      </Text>
    </View>
  );
}

function TodayView() {
  const { data: stats, isLoading: loadingStats } = useDailyStats();
  const { data: activity, isLoading: loadingActivity } = useTodayActivity();

  const revenue = parseFloat(stats?.total_revenue ?? "0");
  const profit = parseFloat(stats?.net_profit ?? "0");
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={styles.metricsRow}>
        {[
          {
            label: "Bought",
            value: String(stats?.cards_bought ?? 0),
            unit: "cards",
            color: "#0057FF",
          },
          {
            label: "Sold",
            value: String(stats?.cards_sold ?? 0),
            unit: "cards",
            color: "#E8001C",
          },
          {
            label: "Spent",
            value: fmt$(stats?.total_spent),
            unit: "",
            color: "#888888",
          },
          {
            label: "Revenue",
            value: fmt$(stats?.total_revenue),
            unit: "",
            color: "white",
          },
          {
            label: "Profit",
            value: fmt$(stats?.net_profit),
            unit: "",
            color: "#00C853",
          },
          { label: "Margin", value: `${margin}%`, unit: "", color: "#0057FF" },
        ].map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            {loadingStats ? (
              <ActivityIndicator color="#333" size="small" />
            ) : (
              <Text style={[styles.metricValue, { color: m.color }]}>
                {m.value}
              </Text>
            )}
            {m.unit ? (
              <Text style={{ color: "#555555", fontSize: 10 }}>{m.unit}</Text>
            ) : null}
          </View>
        ))}
      </View>

      <Text
        style={[
          styles.sectionLabel,
          { paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
        ]}
      >
        LAST 24H TRANSACTIONS
      </Text>

      {loadingActivity ? (
        <Skeleton />
      ) : !activity?.length ? (
        <View
          style={{ marginHorizontal: 20, padding: 24, alignItems: "center" }}
        >
          <Text style={{ color: "#555555", fontSize: 14 }}>
            No transactions yet today
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {activity.map((tx, i) => (
            <View
              key={tx.id}
              style={[
                styles.txRow,
                i < activity.length - 1 && styles.txDivider,
              ]}
            >
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      tx.type === "buy"
                        ? "rgba(0,87,255,0.15)"
                        : "rgba(232,0,28,0.15)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    { color: tx.type === "buy" ? "#0057FF" : "#E8001C" },
                  ]}
                >
                  {tx.type.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.txPlayer}>{tx.playerName}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.txPrice}>
                  ${parseFloat(tx.price).toFixed(0)}
                </Text>
                {tx.profit != null && (
                  <Text
                    style={{ color: "#00C853", fontSize: 12, marginTop: 2 }}
                  >
                    +${parseFloat(tx.profit).toFixed(0)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginHorizontal: 20, marginTop: 20 }}>
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Metrics */}
      <View style={styles.metricsRow}>
        {[
          {
            label: "Revenue",
            value: fmt$(report?.total_revenue),
            color: "white",
          },
          {
            label: "Profit",
            value: fmt$(report?.net_profit),
            color: "#00C853",
          },
          {
            label: "Margin",
            value: `${report?.avg_margin ?? 0}%`,
            color: "#0057FF",
          },
        ].map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            {loadingReport ? (
              <ActivityIndicator color="#333" size="small" />
            ) : (
              <Text style={[styles.metricValue, { color: m.color }]}>
                {m.value}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Cards count row */}
      <View style={[styles.metricsRow, { marginTop: 10 }]}>
        {[
          {
            label: "Bought",
            value: String(report?.cards_bought ?? 0),
            color: "#0057FF",
          },
          {
            label: "Sold",
            value: String(report?.cards_sold ?? 0),
            color: "#E8001C",
          },
          {
            label: "Spent",
            value: fmt$(report?.total_spent),
            color: "#888888",
          },
        ].map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            {loadingReport ? (
              <ActivityIndicator color="#333" size="small" />
            ) : (
              <Text style={[styles.metricValue, { color: m.color }]}>
                {m.value}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Bar chart */}
      {!loadingReport && !!report?.daily_revenue?.length && (
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionLabel}>DAILY REVENUE — {label}</Text>
          <BarChart data={report.daily_revenue} />
        </View>
      )}

      {/* Best deal */}
      {!loadingReport && report?.best_deal && (
        <View style={{ marginHorizontal: 20, marginTop: 16 }}>
          <View
            style={[
              styles.card,
              {
                borderLeftWidth: 3,
                borderLeftColor: "#FFD700",
                marginHorizontal: 0,
              },
            ]}
          >
            <Text style={styles.sectionLabel}>BEST DEAL — {label}</Text>
            <Text
              style={{
                color: "white",
                fontSize: 17,
                fontWeight: "700",
                marginTop: 6,
              }}
            >
              {report.best_deal.player}
            </Text>
            <Text
              style={{
                color: "#00C853",
                fontSize: 20,
                fontWeight: "900",
                marginTop: 4,
              }}
            >
              +${parseFloat(report.best_deal.profit).toFixed(0)} ·{" "}
              {report.best_deal.margin}% margin
            </Text>
          </View>
        </View>
      )}

      {/* Channel breakdown */}
      <Text
        style={[
          styles.sectionLabel,
          { paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
        ]}
      >
        REVENUE BY CHANNEL
      </Text>
      {loadingChannel ? (
        <Skeleton />
      ) : !channelData?.channels?.length ? (
        <View
          style={{ marginHorizontal: 20, padding: 20, alignItems: "center" }}
        >
          <Text style={{ color: "#555555", fontSize: 13 }}>
            No sales data for this period
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {channelData.channels.map((c, i) => (
            <View
              key={c.channel}
              style={[
                { padding: 14 },
                i < channelData.channels.length - 1 && styles.txDivider,
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 14,
                    textTransform: "capitalize",
                  }}
                >
                  {c.channel.replace(/_/g, " ")}
                </Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                  >
                    {fmt$(c.revenue)}
                  </Text>
                  {c.profit > 0 && (
                    <Text
                      style={{ color: "#00C853", fontSize: 11, marginTop: 2 }}
                    >
                      +{fmt$(c.profit)} profit
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={{
                  height: 4,
                  backgroundColor: "#1A1A1A",
                  borderRadius: 2,
                }}
              >
                <View
                  style={{
                    height: 4,
                    width: `${(c.revenue / maxChannel) * 100}%`,
                    backgroundColor: "#0057FF",
                    borderRadius: 2,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function ReportsScreen() {
  const [period, setPeriod] = useState<Period>("today");
  useRefetchDashboardOnFocus();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <View style={styles.periodTabs}>
        {(["today", "week", "month"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodTabText,
                period === p && styles.periodTabTextActive,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "white" },
  periodTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  periodTabActive: { borderBottomColor: "#E8001C" },
  periodTabText: { color: "#555555", fontSize: 15, fontWeight: "600" },
  periodTabTextActive: { color: "white", fontWeight: "700" },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  metricCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  metricLabel: {
    color: "#555555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metricValue: { fontSize: 17, fontWeight: "700" },
  sectionLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
    padding: 16,
  },
  txRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  txDivider: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: "center",
  },
  typeBadgeText: { fontSize: 11, fontWeight: "700" },
  txPlayer: { color: "white", fontWeight: "600", fontSize: 14 },
  txTime: { color: "#555555", fontSize: 11, marginTop: 2 },
  txPrice: { color: "white", fontWeight: "700", fontSize: 14 },
  aiCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#E8001C",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
});
