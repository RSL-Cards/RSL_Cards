import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  MOCK_TODAY_STATS,
  MOCK_TRANSACTIONS,
  MOCK_WEEKLY_REPORT,
} from "../../src/constants/mockData";
import { format } from "date-fns";
// import { AnalyticsErrorBoundary } from "../../src/components/ServiceErrorBoundary";

type Period = "today" | "week" | "month";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 6,
        height: 120,
        marginTop: 12,
      }}
    >
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: "100%",
              height: Math.max((v / max) * 100, 4),
              backgroundColor: "#0057FF",
              borderRadius: 4,
            }}
          />
          <Text style={{ color: "#555555", fontSize: 10, marginTop: 4 }}>
            {DAYS[i]}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TodayView() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Metric cards */}
      <View style={styles.metricsRow}>
        {[
          {
            label: "Revenue",
            value: `$${MOCK_TODAY_STATS.total_revenue}`,
            color: "white",
          },
          {
            label: "Profit",
            value: `$${MOCK_TODAY_STATS.net_profit}`,
            color: "#00C853",
          },
          {
            label: "Margin",
            value: `${Math.round((MOCK_TODAY_STATS.net_profit / MOCK_TODAY_STATS.total_revenue) * 100)}%`,
            color: "#0057FF",
          },
        ].map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={[styles.metricValue, { color: m.color }]}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Transaction list */}
      <Text
        style={[
          styles.sectionLabel,
          { paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
        ]}
      >
        TODAY'S TRANSACTIONS
      </Text>
      <View
        style={{
          marginHorizontal: 20,
          backgroundColor: "#111111",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#2A2A2A",
          overflow: "hidden",
        }}
      >
        {MOCK_TRANSACTIONS.map((tx, i) => (
          <View
            key={tx.id}
            style={[
              styles.txRow,
              i < MOCK_TRANSACTIONS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: "#2A2A2A",
              },
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
              <Text style={styles.txPlayer}>{tx.player_name}</Text>
              <Text style={styles.txMeta}>
                {tx.grade_key} · {tx.payment_method}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.txPrice}>${tx.price.toFixed(0)}</Text>
              {tx.profit != null && (
                <Text style={{ color: "#00C853", fontSize: 12, marginTop: 2 }}>
                  +${tx.profit}
                </Text>
              )}
              <Text style={styles.txTime}>
                {format(new Date(tx.created_at), "h:mm a")}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* AI Summary */}
      <View style={{ marginHorizontal: 20, marginTop: 20 }}>
        <View style={styles.aiCard}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
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
            Strong show day — 65.7% best margin
          </Text>
          <Text style={{ color: "#888888", fontSize: 13, lineHeight: 19 }}>
            Your Jayden Daniels raw card was your best deal today at 65.7%
            margin. 3 sales · 4 purchases. Net profit trending above your weekly
            average.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function WeekView() {
  const maxChannel = Math.max(
    ...MOCK_WEEKLY_REPORT.by_channel.map((c) => c.revenue),
  );
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Week metrics */}
      <View style={styles.metricsRow}>
        {[
          {
            label: "Revenue",
            value: `$${MOCK_WEEKLY_REPORT.total_revenue.toLocaleString()}`,
            color: "white",
          },
          {
            label: "Profit",
            value: `$${MOCK_WEEKLY_REPORT.net_profit.toLocaleString()}`,
            color: "#00C853",
          },
          {
            label: "Margin",
            value: `${MOCK_WEEKLY_REPORT.avg_margin}%`,
            color: "#0057FF",
          },
        ].map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={[styles.metricValue, { color: m.color }]}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Bar chart */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 20,
          backgroundColor: "#111111",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#2A2A2A",
        }}
      >
        <Text style={styles.sectionLabel}>
          DAILY REVENUE — {MOCK_WEEKLY_REPORT.week}
        </Text>
        <BarChart data={MOCK_WEEKLY_REPORT.daily_revenue} />
      </View>

      {/* Best card */}
      <View style={{ marginHorizontal: 20, marginTop: 16 }}>
        <View
          style={{
            backgroundColor: "#111111",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            borderLeftWidth: 3,
            borderLeftColor: "#FFD700",
          }}
        >
          <Text style={styles.sectionLabel}>BEST DEAL THIS WEEK</Text>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "700",
              marginTop: 4,
            }}
          >
            {MOCK_WEEKLY_REPORT.best_card.player}
          </Text>
          <Text
            style={{
              color: "#00C853",
              fontSize: 22,
              fontWeight: "900",
              marginTop: 4,
            }}
          >
            +${MOCK_WEEKLY_REPORT.best_card.profit} ·{" "}
            {MOCK_WEEKLY_REPORT.best_card.margin}% margin
          </Text>
        </View>
      </View>

      {/* Channel breakdown */}
      <View style={{ marginHorizontal: 20, marginTop: 16 }}>
        <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>
          REVENUE BY CHANNEL
        </Text>
        <View
          style={{
            backgroundColor: "#111111",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            overflow: "hidden",
          }}
        >
          {MOCK_WEEKLY_REPORT.by_channel.map((c, i) => (
            <View
              key={c.channel}
              style={[
                { padding: 14 },
                i < MOCK_WEEKLY_REPORT.by_channel.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: "#2A2A2A",
                },
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
                  style={{ color: "white", fontWeight: "600", fontSize: 14 }}
                >
                  {c.channel}
                </Text>
                <Text
                  style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                >
                  ${c.revenue.toLocaleString()}
                </Text>
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
      </View>
    </ScrollView>
  );
}

function MonthView() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={styles.metricsRow}>
        {[
          { label: "Revenue", value: "$18,240", color: "white" },
          { label: "Profit", value: "$4,820", color: "#00C853" },
          { label: "Cards", value: "62", color: "#0057FF" },
        ].map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={[styles.metricValue, { color: m.color }]}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 20,
          backgroundColor: "#111111",
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: "#2A2A2A",
        }}
      >
        <Text
          style={{
            color: "#888888",
            fontSize: 13,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          April 2026 is tracking{"\n"}
          <Text style={{ color: "#00C853", fontSize: 22, fontWeight: "900" }}>
            +26.4%
          </Text>
          {"\n"}above your monthly average
        </Text>
      </View>
    </ScrollView>
  );
}

function ReportsScreen() {
  const [period, setPeriod] = useState<Period>("today");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      {/* Period tabs */}
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
      {period === "week" && <WeekView />}
      {period === "month" && <MonthView />}
    </SafeAreaView>
  );
}

// Export without error boundary
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
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  metricLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metricValue: { fontSize: 18, fontWeight: "700" },
  sectionLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  txRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
    alignItems: "center",
  },
  typeBadgeText: { fontSize: 11, fontWeight: "700" },
  txPlayer: { color: "white", fontWeight: "600", fontSize: 14 },
  txMeta: { color: "#555555", fontSize: 11, marginTop: 2 },
  txPrice: { color: "white", fontWeight: "700", fontSize: 14 },
  txTime: { color: "#555555", fontSize: 11, marginTop: 2 },
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
