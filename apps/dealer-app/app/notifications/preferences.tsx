import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import {
  View,
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
import { Surface } from "../../src/components/ui/Surface";

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
  dailyLogs: ChannelPrefs;
}

const DEFAULT_PREFS: NotificationPreferences = {
  priceSpikes: { push: true, email: true },
  inventoryAging: { push: false, email: true },
  failedSync: { push: true, email: false },
  newSales: { push: true, email: true },
  weeklyReport: { push: false, email: true },
  dailyLogs: { push: true, email: true },
};

const SECTIONS = [
  {
    title: "OPERATIONAL ALERTS",
    items: [
      {
        key: "priceSpikes" as keyof NotificationPreferences,
        icon: "trending-up-outline" as const,
        iconColor: "#FFD700",
        label: "Price Spikes (>10%)",
        description: "Instant alert when a card in your inventory spikes 10%+ in market value.",
      },
      {
        key: "inventoryAging" as keyof NotificationPreferences,
        icon: "time-outline" as const,
        iconColor: "#FFB300",
        label: "Inventory Aging (>60 Days)",
        description: "Alerts for cards sitting in inventory for over 60 days.",
      },
      {
        key: "failedSync" as keyof NotificationPreferences,
        icon: "cloud-offline-outline" as const,
        iconColor: "#E8001C",
        label: "Failed Marketplace Sync",
        description: "Notified when a listing fails to sync to eBay.",
      },
    ],
  },
  {
    title: "SALES & PERFORMANCE REPORTS",
    items: [
      {
        key: "newSales" as keyof NotificationPreferences,
        icon: "cash-outline" as const,
        iconColor: "#00C853",
        label: "New Sales & Payouts",
        description: "Instant notification when a card is sold or a payout is received.",
      },
      {
        key: "weeklyReport" as keyof NotificationPreferences,
        icon: "bar-chart-outline" as const,
        iconColor: "#0057FF",
        label: "Weekly Performance Report",
        description: "Automated report delivered every Sunday at 9:00 AM with sales & margin breakdown.",
      },
      {
        key: "dailyLogs" as keyof NotificationPreferences,
        icon: "calendar-outline" as const,
        iconColor: "#9C27B0",
        label: "11:00 PM Daily Log Close Alert",
        description: "Nightly push alert & email digest at 11:00 PM local time to close open daily logs.",
      },
    ],
  },
];

async function fetchPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<{ notification_preferences?: Partial<NotificationPreferences> }>(
    "/v1/users/me/notification-preferences"
  );
  const raw = data.notification_preferences ?? {};
  return {
    priceSpikes: raw.priceSpikes ?? DEFAULT_PREFS.priceSpikes,
    inventoryAging: raw.inventoryAging ?? DEFAULT_PREFS.inventoryAging,
    failedSync: raw.failedSync ?? DEFAULT_PREFS.failedSync,
    newSales: raw.newSales ?? DEFAULT_PREFS.newSales,
    weeklyReport: raw.weeklyReport ?? DEFAULT_PREFS.weeklyReport,
    dailyLogs: raw.dailyLogs ?? {
      push: (raw as any).notify_daily_close_push !== false,
      email: (raw as any).notify_daily_close_email !== false,
    },
  };
}

async function savePreferences(prefs: NotificationPreferences): Promise<void> {
  await apiClient.patch("/v1/users/me/notification-preferences", {
    notification_preferences: prefs,
  });
}

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
      Toast.show({ type: "success", text1: "Preferences updated" });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Failed to update preferences" });
    },
  });

  const toggle = (key: keyof NotificationPreferences, channel: "push" | "email") => {
    const current = prefs[key] || DEFAULT_PREFS[key] || { push: true, email: true };
    const updated: NotificationPreferences = {
      ...DEFAULT_PREFS,
      ...prefs,
      [key]: {
        push: channel === "push" ? !current.push : (current.push ?? true),
        email: channel === "email" ? !current.email : (current.email ?? true),
      },
    };
    setPrefs(updated);
    save(updated);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#0057FF" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Typography variant="h3" weight="800">
            Notification Preferences
          </Typography>
        </View>
        <View style={{ width: 40, alignItems: "flex-end" }}>
          {isSaving && <ActivityIndicator size="small" color="#0057FF" />}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}>
        <Typography variant="caption" color={COLORS.zinc500} style={{ marginBottom: SPACING.lg, textAlign: "center" }}>
          Manage your real-time push notifications and automated email reports.
        </Typography>

        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: SPACING.xl }}>
            <Typography variant="label" color={COLORS.zinc500} style={styles.sectionTitle}>
              {section.title}
            </Typography>

            <View style={{ gap: 12 }}>
              {section.items.map((item) => {
                const channelPref = prefs[item.key] ?? { push: false, email: false };

                return (
                  <Surface key={item.key} variant="elevated" padding="none" style={styles.prefCard}>
                    {/* Top Row: Icon + Title + Description */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconWrap, { backgroundColor: `${item.iconColor}18` }]}>
                        <Ionicons name={item.icon} size={18} color={item.iconColor} />
                      </View>
                      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                        <Typography variant="body" weight="700">
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 2, lineHeight: 16 }}>
                          {item.description}
                        </Typography>
                      </View>
                    </View>

                    {/* Bottom Row: Channel Switches */}
                    <View style={styles.togglesRow}>
                      <View style={styles.toggleCell}>
                        <Ionicons name="phone-portrait-outline" size={14} color={channelPref.push ? "#FFF" : COLORS.zinc500} />
                        <Typography variant="caption" weight="600" color={channelPref.push ? COLORS.white : COLORS.zinc500} style={{ flex: 1 }}>
                          Push
                        </Typography>
                        <Switch
                          value={channelPref.push}
                          onValueChange={() => toggle(item.key, "push")}
                          trackColor={{ false: "#222222", true: item.iconColor }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="#222222"
                        />
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.toggleCell}>
                        <Ionicons name="mail-outline" size={14} color={channelPref.email ? "#FFF" : COLORS.zinc500} />
                        <Typography variant="caption" weight="600" color={channelPref.email ? COLORS.white : COLORS.zinc500} style={{ flex: 1 }}>
                          Email
                        </Typography>
                        <Switch
                          value={channelPref.email}
                          onValueChange={() => toggle(item.key, "email")}
                          trackColor={{ false: "#222222", true: item.iconColor }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="#222222"
                        />
                      </View>
                    </View>
                  </Surface>
                );
              })}
            </View>
          </View>
        ))}

        {/* Footer info note */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.zinc600} />
          <Typography variant="caption" color={COLORS.zinc600} style={{ flex: 1, fontSize: 11, lineHeight: 16 }}>
            Preferences auto-save when toggled. Ensure notification permissions are enabled on your device to receive push alerts.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 54,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  prefCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222222",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  togglesRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#1D1D1D",
    backgroundColor: "#0A0A0A",
  },
  toggleCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  divider: {
    width: 1,
    backgroundColor: "#1D1D1D",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
