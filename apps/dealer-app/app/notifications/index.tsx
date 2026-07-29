import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useNotificationStore } from "../../src/stores/useNotificationStore";
import { apiClient } from "../../src/lib/apiClient";

const TYPE_CONFIG: Record<string, { icon: string; accent: string }> = {
  sale:         { icon: "💰", accent: "#00C853" },
  aging_alert:  { icon: "⚠️",  accent: "#FFB300" },
  ai_narrative: { icon: "🤖", accent: "#0057FF" },
  price_alert:  { icon: "📈", accent: "#E8001C" },
  failed_sync:  { icon: "❌", accent: "#E8001C" },
};

function formatNotificationDate(rawDate?: number | string): string {
  if (!rawDate) return "";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day} ${month}, ${year} at ${formattedHours}:${minutes} ${ampm}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const unread = notifications.filter((n) => n.status !== 'read').length;

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      markAllAsRead();
      await apiClient.patch("/v1/notifications/read-all");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          {unread > 0 && (
            <Text style={styles.unreadHint}>{unread} unread</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0057FF"
            colors={["#0057FF"]}
          />
        }
      >
        {notifications.map((n) => {
          const cfg = TYPE_CONFIG[n.type] ?? { icon: "🔔", accent: "#555555" };
          const isRead = n.status === 'read';
          return (
            <TouchableOpacity key={n.id} style={[styles.card, !isRead && styles.cardUnread]} activeOpacity={0.75}>
              {/* Unread dot */}
              {!isRead && <View style={[styles.unreadDot, { backgroundColor: cfg.accent }]} />}

              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: `${cfg.accent}18` }]}>
                <Text style={styles.icon}>{cfg.icon}</Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.notifTitle, !isRead && { color: "white" }]} numberOfLines={1}>
                  {n.title}
                </Text>
                <Text style={styles.body} numberOfLines={2}>{n.body || n.message}</Text>
                <Text style={styles.time}>{formatNotificationDate(n.createdAt || n.created_at)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn:   { padding: 4 },
  backArrow: { color: "white", fontSize: 22 },
  title:     { fontSize: 22, fontWeight: "800", color: "white", letterSpacing: -0.5 },
  unreadHint:{ fontSize: 12, color: "#555555", marginTop: 1 },
  markAll:   { color: "#0057FF", fontSize: 13, fontWeight: "600" },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0E0E0E",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    gap: 12,
  },
  cardUnread: {
    backgroundColor: "#111111",
    borderColor: "#222222",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 18 },

  content:   { flex: 1 },
  titleRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  notifTitle:{ color: "#AAAAAA", fontWeight: "700", fontSize: 14, marginBottom: 2 },
  time:      { color: "#71717a", fontSize: 11, marginTop: 4, fontWeight: "500" },
  body:      { color: "#999999", fontSize: 13, lineHeight: 18 },
});
