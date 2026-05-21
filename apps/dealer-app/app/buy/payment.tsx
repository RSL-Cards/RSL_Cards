import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDealTabStore } from "../../src/stores/dealTabStore";

const STEP_PCT = "80%";

const BUY_CHANNELS = [
  { key: "card_show", icon: "business-outline", color: "#FF9800", label: "Card Show" },
  { key: "ebay", icon: "cart-outline", color: "#E53238", label: "eBay" },
  { key: "facebook", icon: "logo-facebook", color: "#1877F2", label: "Facebook" },
  { key: "app", icon: "chatbubbles-outline", color: "#4CAF50", label: "App/DM" },
  { key: "comc", icon: "cube-outline", color: "#9C27B0", label: "COMC" },
  { key: "other", icon: "search-outline", color: "#888888", label: "Other" },
];

const PAYMENT_METHODS = [
  { key: "cash", icon: "cash-outline", color: "#00C853", label: "Cash", lastUsed: false },
  { key: "venmo", icon: "wallet-outline", color: "#008CFF", label: "Venmo", lastUsed: true },
  { key: "zelle", icon: "card-outline", color: "#6C1CD1", label: "Zelle", lastUsed: false },
  { key: "paypal", icon: "logo-paypal", color: "#003087", label: "PayPal", lastUsed: false },
  { key: "cashapp", icon: "logo-usd", color: "#00D632", label: "CashApp", lastUsed: false },
  { key: "trade", icon: "swap-horizontal-outline", color: "#888888", label: "Trade", lastUsed: false },
  { key: "other", icon: "card-outline", color: "#888888", label: "Other", lastUsed: false },
];

export default function BuyPaymentScreen() {
  const router = useRouter();
  const tabs = useDealTabStore((s) => s.tabs);
  const updateTab = useDealTabStore((s) => s.updateTab);
  const activeTab = tabs[tabs.length - 1];
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const canContinue = !!selected && !!selectedChannel;

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Select payment method</Text>
        <View style={styles.grid}>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.methodCard,
                selected === m.key && styles.methodCardSelected,
              ]}
              onPress={() => setSelected(m.key)}
              activeOpacity={0.75}
            >
              {m.lastUsed && (
                <View style={styles.lastUsedBadge}>
                  <Text style={styles.lastUsedText}>Last used</Text>
                </View>
              )}
              <Ionicons name={m.icon as any} size={28} color={selected === m.key ? "white" : m.color} style={{ marginBottom: 6 }} />
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

        <Text style={[styles.title, { marginTop: 28 }]}>
          Where did you buy it?
        </Text>
        <View style={styles.grid}>
          {BUY_CHANNELS.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.methodCard,
                selectedChannel === c.key && styles.channelCardSelected,
              ]}
              onPress={() => setSelectedChannel(c.key)}
              activeOpacity={0.75}
            >
              <Ionicons name={c.icon as any} size={28} color={selectedChannel === c.key ? "white" : c.color} style={{ marginBottom: 6 }} />
              <Text
                style={[
                  styles.methodLabel,
                  selectedChannel === c.key && { color: "white" },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
          disabled={!canContinue}
          onPress={() => {
            if (activeTab?.id && selected && selectedChannel)
              updateTab(activeTab.id, {
                paymentMethod: selected,
                channel: selectedChannel,
              });
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
  channelCardSelected: {
    borderWidth: 2,
    borderColor: "#E8001C",
    backgroundColor: "rgba(232,0,28,0.1)",
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
