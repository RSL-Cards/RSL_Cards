import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

const FEATURES = [
  { icon: "📦", title: "Smart Inventory", desc: "Track every card with real-time PSA, BGS, and SGC grading data. Bulk import, revalue, and organize your collection effortlessly." },
  { icon: "📈", title: "Live Price Intelligence", desc: "See eBay sold comps, price history charts, and AI-powered deal ratings for every card in seconds." },
  { icon: "🛒", title: "Multi-Platform Listing", desc: "Publish listings to eBay, Whatnot, Mercari, TCGPlayer, and Shopify simultaneously from one screen." },
  { icon: "💰", title: "Sales & Transactions", desc: "Record manual sales, track payouts, and get a full P&L breakdown across all selling channels." },
  { icon: "🤖", title: "AI Narratives", desc: "Generate compelling, platform-optimized listing descriptions using Gemini AI — trained on card collector language." },
  { icon: "📊", title: "Analytics & Reports", desc: "Weekly performance reports, margin analysis, and inventory aging alerts delivered via push and email." },
  { icon: "🔔", title: "Real-Time Alerts", desc: "Get notified instantly on new sales, price spikes, failed syncs, and aging inventory — across push and email." },
  { icon: "🏷️", title: "Showcase Profile", desc: "Share a public dealer profile page with your inventory, ratings, and sell channels with buyers." },
];

const LINKS = [
  { icon: "globe-outline" as const, label: "Website", url: "https://rslcardspro.com" },
  { icon: "mail-outline" as const, label: "Support Email", url: "mailto:support@rslcardspro.com" },
  { icon: "document-text-outline" as const, label: "Terms of Service", url: "https://rslcardspro.com/terms" },
  { icon: "shield-checkmark-outline" as const, label: "Privacy Policy", url: "https://rslcardspro.com/privacy" },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About RSL Cards</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require("../../assets/rslicon.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>RSL Cards Pro</Text>
          <Text style={styles.tagline}>The professional card dealer platform.</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0.0 · Built for serious dealers</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              RSL Cards Pro was built to give sports card dealers a competitive edge. We combine inventory management,
              live market data, AI-powered tools, and multi-platform selling into a single, fast mobile experience —
              so you spend less time on admin and more time finding the next great deal.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Inside</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Links</Text>
          <View style={styles.linksCard}>
            {LINKS.map((l, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.linkRow, i < LINKS.length - 1 && styles.linkBorder]}
                onPress={() => Linking.openURL(l.url)}
                activeOpacity={0.7}
              >
                <Ionicons name={l.icon} size={18} color={COLORS.zinc400} style={{ marginRight: 12 }} />
                <Text style={styles.linkLabel}>{l.label}</Text>
                <Ionicons name="open-outline" size={14} color={COLORS.zinc600} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2025 RSL Cards Pro. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },

  hero: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 14,
  },
  appName: { fontSize: 26, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: COLORS.zinc400, marginTop: 4, marginBottom: 10 },
  versionBadge: {
    backgroundColor: "rgba(0,87,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,87,255,0.25)",
  },
  versionText: { fontSize: 12, color: "#4488FF", fontWeight: "600" },

  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.zinc500,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  missionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  missionText: { fontSize: 14, color: COLORS.zinc400, lineHeight: 22 },

  featureRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  featureIcon: { fontSize: 22, width: 28, textAlign: "center", marginTop: 1 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 3 },
  featureDesc: { fontSize: 13, color: COLORS.zinc500, lineHeight: 19 },

  linksCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  linkBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  linkLabel: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: "500" },

  footer: {
    textAlign: "center",
    color: COLORS.zinc600,
    fontSize: 12,
    marginTop: 32,
    paddingBottom: 8,
  },
});
