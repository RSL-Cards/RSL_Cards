import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MOCK_NOTIFICATIONS } from "../../src/constants/mockData";

const TYPE_CONFIG: Record<string, { icon: string; accent: string }> = {
  sale:         { icon: "💰", accent: "#00C853" },
  aging_alert:  { icon: "⚠️",  accent: "#FFB300" },
  ai_narrative: { icon: "🤖", accent: "#0057FF" },
  price_alert:  { icon: "📈", accent: "#E8001C" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;

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
        <TouchableOpacity>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {MOCK_NOTIFICATIONS.map((n) => {
          const cfg = TYPE_CONFIG[n.type] ?? { icon: "🔔", accent: "#555555" };
          return (
            <TouchableOpacity key={n.id} style={[styles.card, !n.is_read && styles.cardUnread]} activeOpacity={0.75}>
              {/* Unread dot */}
              {!n.is_read && <View style={[styles.unreadDot, { backgroundColor: cfg.accent }]} />}

              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: `${cfg.accent}18` }]}>
                <Text style={styles.icon}>{cfg.icon}</Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.notifTitle, !n.is_read && { color: "white" }]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
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
  notifTitle:{ color: "#AAAAAA", fontWeight: "700", fontSize: 14, flex: 1, marginRight: 8 },
  time:      { color: "#444444", fontSize: 11 },
  body:      { color: "#555555", fontSize: 13, lineHeight: 18 },
});
