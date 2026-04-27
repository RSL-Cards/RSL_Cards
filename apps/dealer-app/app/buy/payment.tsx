import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useDealTabStore } from "../../src/stores/dealTabStore";

const STEP_PCT = "80%";

const PAYMENT_METHODS = [
  { key: "cash", icon: "💵", label: "Cash", lastUsed: false },
  { key: "venmo", icon: "💜", label: "Venmo", lastUsed: true },
  { key: "zelle", icon: "💙", label: "Zelle", lastUsed: false },
  { key: "paypal", icon: "🅿️", label: "PayPal", lastUsed: false },
  { key: "cashapp", icon: "💚", label: "CashApp", lastUsed: false },
  { key: "trade", icon: "🔄", label: "Trade", lastUsed: false },
  { key: "other", icon: "💳", label: "Other", lastUsed: false },
];

export default function BuyPaymentScreen() {
  const router = useRouter();
  const tabs = useDealTabStore((s) => s.tabs);
  const updateTab = useDealTabStore((s) => s.updateTab);
  const activeTab = tabs[tabs.length - 1];
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BUY — Step 4 of 5</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: STEP_PCT }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Select payment method</Text>

        <View style={styles.grid}>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.methodCard,
                selected === m.key && styles.methodCardSelected,
              ]}
              onPress={() => {
                setSelected(m.key);
              }}
              activeOpacity={0.75}
            >
              {m.lastUsed && (
                <View style={styles.lastUsedBadge}>
                  <Text style={styles.lastUsedText}>Last used</Text>
                </View>
              )}
              <Text style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</Text>
              <Text
                style={[
                  styles.methodLabel,
                  selected === m.key && { color: "white" },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, !selected && styles.primaryBtnDisabled]}
          disabled={!selected}
          onPress={() => {
            if (activeTab?.id && selected)
              updateTab(activeTab.id, { paymentMethod: selected });
            router.push("/buy/confirm");
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>CONTINUE →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backText: { color: "white", fontSize: 28 },
  headerTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  progressBar: { height: 3, backgroundColor: "#1A1A1A" },
  progressFill: { height: 3, backgroundColor: "#0057FF" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  title: { color: "white", fontSize: 22, fontWeight: "700", marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  methodCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    position: "relative",
  },
  methodCardSelected: {
    borderWidth: 2,
    borderColor: "#0057FF",
    backgroundColor: "rgba(0,87,255,0.1)",
  },
  lastUsedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,200,83,0.2)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  lastUsedText: { color: "#00C853", fontSize: 8, fontWeight: "700" },
  methodLabel: { color: "#888888", fontSize: 13, fontWeight: "600" },
  bottomBar: { padding: 20, borderTopWidth: 1, borderTopColor: "#2A2A2A" },
  primaryBtn: {
    backgroundColor: "#0057FF",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: { backgroundColor: "#1A1A1A" },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
