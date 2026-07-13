import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../src/lib/apiClient";
import Toast from "react-native-toast-message";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChannelPrefs {
  push: boolean;
  email: boolean;
}

interface NotificationPreferences {
  priceSpikes: ChannelPrefs;
  inventoryAging: ChannelPrefs;
  failedSync: ChannelPrefs;
  newSales: ChannelPrefs;
  weeklyReport: ChannelPrefs;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const DEFAULT_PREFS: NotificationPreferences = {
  priceSpikes:    { push: true,  email: true  },
  inventoryAging: { push: false, email: true  },
  failedSync:     { push: true,  email: false },
  newSales:       { push: true,  email: true  },
  weeklyReport:   { push: false, email: true  },
};

const PREF_CONFIG: {
  key: keyof NotificationPreferences;
  icon: string;
  iconColor: string;
  label: string;
  description: string;
}[] = [
  {
    key: "priceSpikes",
    icon: "trending-up",
    iconColor: "#E8001C",
    label: "Price Spikes Above 10%",
    description: "Alert when a card you own spikes more than 10% in market value.",
  },
  {
    key: "inventoryAging",
    icon: "time-outline",
    iconColor: "#FFB300",
    label: "Inventory Aging Over 60 Days",
    description: "Cards sitting unsold for more than 60 days need attention.",
  },
  {
    key: "failedSync",
    icon: "cloud-offline-outline",
    iconColor: "#FF5C5C",
    label: "Failed Marketplace Sync",
    description: "Notified when a listing fails to sync to eBay, Whatnot, or other platforms.",
  },
  {
    key: "newSales",
    icon: "cash-outline",
    iconColor: "#00C853",
    label: "New Sales & Payouts",
    description: "Instant alert when a sale is recorded or a payout is received.",
  },
  {
    key: "weeklyReport",
    icon: "bar-chart-outline",
    iconColor: "#0057FF",
    label: "Weekly Performance Report",
    description: "Summary of weekly sales, margins, and top performers delivered every Monday.",
  },
];

// ─── API calls ────────────────────────────────────────────────────────────────
async function fetchPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<{ notification_preferences?: NotificationPreferences }>(
    "/v1/users/me/notification-preferences"
  );
  return data.notification_preferences ?? DEFAULT_PREFS;
}

async function savePreferences(prefs: NotificationPreferences): Promise<void> {
  await apiClient.patch("/v1/users/me/notification-preferences", {
    notification_preferences: prefs,
  });
}

// ─── Sub-component: channel badges ────────────────────────────────────────────
function ChannelBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: serverPrefs, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: fetchPreferences,
  });

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    if (serverPrefs) setPrefs(serverPrefs);
  }, [serverPrefs]);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: savePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      Toast.show({ type: "success", text1: "Preferences saved" });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Failed to save", text2: "Please try again." });
    },
  });

  const toggle = (key: keyof NotificationPreferences, channel: "push" | "email") => {
    const updated = {
      ...prefs,
      [key]: { ...prefs[key], [channel]: !prefs[key][channel] },
    };
    setPrefs(updated);
    save(updated);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notification Preferences</Text>
          <Text style={styles.headerSub}>Control operational alerts and report delivery.</Text>
        </View>
        {isSaving && <ActivityIndicator size="small" color={COLORS.primary} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Channel legend */}
        <View style={styles.legendWrap}>
          <View style={styles.legendRow}>
            <Ionicons name="phone-portrait-outline" size={14} color={COLORS.zinc400} />
            <Text style={styles.legendText}>Push = In-app notification on your device</Text>
          </View>
          <View style={styles.legendRow}>
            <Ionicons name="mail-outline" size={14} color={COLORS.zinc400} />
            <Text style={styles.legendText}>Email = Sent to your registered email address</Text>
          </View>
        </View>

        {/* Preference cards */}
        {PREF_CONFIG.map((cfg) => {
          const pref = prefs[cfg.key];
          return (
            <View key={cfg.key} style={styles.prefCard}>
              {/* Top row */}
              <View style={styles.prefHeader}>
                <View style={[styles.prefIconWrap, { backgroundColor: `${cfg.iconColor}18` }]}>
                  <Ionicons name={cfg.icon as any} size={18} color={cfg.iconColor} />
                </View>
                <View style={styles.prefInfo}>
                  <Text style={styles.prefLabel}>{cfg.label}</Text>
                  <Text style={styles.prefDesc}>{cfg.description}</Text>
                </View>
              </View>

              {/* Active channel badges summary */}
              <View style={styles.badgesRow}>
                <ChannelBadge active={pref.push} label="📱 Push" />
                <ChannelBadge active={pref.email} label="✉️ Email" />
              </View>

              {/* Toggles */}
              <View style={styles.togglesRow}>
                <View style={styles.toggleItem}>
                  <Ionicons name="phone-portrait-outline" size={14} color={COLORS.zinc500} />
                  <Text style={styles.toggleLabel}>Push</Text>
                  <Switch
                    value={pref.push}
                    onValueChange={() => toggle(cfg.key, "push")}
                    trackColor={{ false: COLORS.border, true: cfg.iconColor }}
                    thumbColor="white"
                    ios_backgroundColor={COLORS.border}
                  />
                </View>
                <View style={styles.toggleDivider} />
                <View style={styles.toggleItem}>
                  <Ionicons name="mail-outline" size={14} color={COLORS.zinc500} />
                  <Text style={styles.toggleLabel}>Email</Text>
                  <Switch
                    value={pref.email}
                    onValueChange={() => toggle(cfg.key, "email")}
                    trackColor={{ false: COLORS.border, true: cfg.iconColor }}
                    thumbColor="white"
                    ios_backgroundColor={COLORS.border}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* Info footer */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.zinc600} />
          <Text style={styles.footerNoteText}>
            Changes are saved automatically. Push notifications require the app to be installed with notification permission granted.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: 12,
  },
  backBtn: { padding: 4, marginTop: 2 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.zinc500, marginTop: 2 },

  legendWrap: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: 4,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText: { fontSize: 12, color: COLORS.zinc500 },

  prefCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  prefHeader: {
    flexDirection: "row",
    gap: 12,
    padding: SPACING.md,
    alignItems: "flex-start",
  },
  prefIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  prefInfo: { flex: 1 },
  prefLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 3 },
  prefDesc: { fontSize: 12, color: COLORS.zinc500, lineHeight: 17 },

  badgesRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "rgba(0,87,255,0.12)",
    borderColor: "rgba(0,87,255,0.3)",
  },
  badgeInactive: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: COLORS.border,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  badgeTextActive: { color: "#4488FF" },
  badgeTextInactive: { color: COLORS.zinc600 },

  togglesRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  toggleItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 6,
  },
  toggleDivider: { width: 1, backgroundColor: COLORS.border },
  toggleLabel: { flex: 1, fontSize: 13, color: COLORS.zinc400, fontWeight: "500" },

  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  footerNoteText: { flex: 1, fontSize: 11, color: COLORS.zinc600, lineHeight: 16 },
});
