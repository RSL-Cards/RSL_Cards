import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";

const PLATFORM_FEATURES = [
  {
    icon: "camera-outline" as const,
    iconColor: "#0057FF",
    title: "RSL Vision AI Scanner",
    desc: "Computer vision and Gemini AI scanner to instantly identify card player, year, set, variation, and grade from photos or slab barcodes.",
  },
  {
    icon: "layers-outline" as const,
    iconColor: "#FFD700",
    title: "Smart Inventory & Multi-Grade Comps",
    desc: "Catalog RAW and Graded cards (PSA, BGS, SGC, CGC) with real-time median comps and price trend graphs from eBay & MySlabs.",
  },
  {
    icon: "swap-horizontal-outline" as const,
    iconColor: "#00C853",
    title: "Buy, Sell & Trade Ledger",
    desc: "Complete transaction management with automated cost basis, net profit calculations, inventory status updates, and cash adjustments.",
  },
  {
    icon: "globe-outline" as const,
    iconColor: "#FF9100",
    title: "eBay Marketplace Integration",
    desc: "Seamlessly publish, manage, and sync listings to eBay with automated sales tracking from your mobile dashboard.",
  },
  {
    icon: "analytics-outline" as const,
    iconColor: "#9C27B0",
    title: "Card Show & Daily Logs",
    desc: "Open and track Card Show logs with real-time show activity, net cash adjustments, and automated show closing stats.",
  },
  {
    icon: "notifications-outline" as const,
    iconColor: "#E8001C",
    title: "Automated Alerts & Weekly Reports",
    desc: "BullMQ-powered background alerts for Price Spikes (>10%), Inventory Aging (>60d), and automated Sunday Weekly Reports.",
  },
];

const QUICK_LINKS = [
  { icon: "globe-outline" as const, label: "Official Web Portal", sub: "app.rslcards.com", url: "https://rslcardspro.com" },
  { icon: "mail-outline" as const, label: "Dealer Support", sub: "support@rslcardspro.com", url: "mailto:support@rslcardspro.com" },
  { icon: "document-text-outline" as const, label: "Terms of Service", sub: "Platform Guidelines", url: "https://rslcardspro.com/terms" },
  { icon: "shield-checkmark-outline" as const, label: "Privacy Policy", sub: "Data Protection", url: "https://rslcardspro.com/privacy" },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Typography variant="h3" weight="800">
            About RSL Cards
          </Typography>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}>
        {/* App Hero Badge */}
        <Surface variant="elevated" padding="md" style={styles.heroBox}>
          <Image
            source={require("../../assets/rslicon.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Typography variant="h2" weight="900" style={{ letterSpacing: -0.5, marginTop: 10 }}>
            RSL Cards Pro
          </Typography>
          <Typography variant="body" color={COLORS.zinc400} style={{ marginTop: 4, textAlign: "center" }}>
            The premier sports card dealer platform &amp; marketplace engine.
          </Typography>

          <View style={styles.versionPill}>
            <Ionicons name="shield-checkmark" size={12} color="#0057FF" />
            <Typography variant="caption" weight="700" color="#0057FF" style={{ fontSize: 11 }}>
              Version 1.0.0 · Production Suite
            </Typography>
          </View>
        </Surface>

        {/* Mission Statement */}
        <View style={{ marginTop: SPACING.xl }}>
          <Typography variant="label" color={COLORS.zinc500} style={styles.sectionTitle}>
            OUR MISSION
          </Typography>
          <Surface variant="elevated" padding="md" style={styles.contentCard}>
            <Typography variant="body" color={COLORS.zinc300} style={{ lineHeight: 22 }}>
              RSL Cards Pro combines computerized vision scanning, real-time marketplace sales comps, multi-platform e-commerce synchronization, and automated profit ledgering to give dealers a high-speed competitive advantage on the show floor and online.
            </Typography>
          </Surface>
        </View>

        {/* Core Platform Capabilities */}
        <View style={{ marginTop: SPACING.xl }}>
          <Typography variant="label" color={COLORS.zinc500} style={styles.sectionTitle}>
            PLATFORM CAPABILITIES
          </Typography>

          <View style={{ gap: 12 }}>
            {PLATFORM_FEATURES.map((item) => (
              <Surface key={item.title} variant="elevated" padding="md" style={styles.featureCard}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.iconColor}18` }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Typography variant="body" weight="700">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 4, lineHeight: 17 }}>
                    {item.desc}
                  </Typography>
                </View>
              </Surface>
            ))}
          </View>
        </View>

        {/* Official Resources & Links */}
        <View style={{ marginTop: SPACING.xl }}>
          <Typography variant="label" color={COLORS.zinc500} style={styles.sectionTitle}>
            OFFICIAL RESOURCES
          </Typography>

          <Surface variant="elevated" padding="none" style={styles.contentCard}>
            {QUICK_LINKS.map((link, idx, arr) => (
              <TouchableOpacity
                key={link.label}
                onPress={() => Linking.openURL(link.url)}
                activeOpacity={0.7}
                style={[
                  styles.linkRow,
                  idx < arr.length - 1 && styles.linkDivider,
                ]}
              >
                <View style={styles.linkIconWrap}>
                  <Ionicons name={link.icon} size={16} color="#0057FF" />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <Typography variant="body" weight="700" style={{ fontSize: 14 }}>
                    {link.label}
                  </Typography>
                  <Typography variant="caption" color={COLORS.zinc500} style={{ fontSize: 11 }}>
                    {link.sub}
                  </Typography>
                </View>
                <Ionicons name="open-outline" size={14} color={COLORS.zinc600} />
              </TouchableOpacity>
            ))}
          </Surface>
        </View>

        {/* Footer Copyright */}
        <View style={{ marginTop: SPACING.xxl, alignItems: "center" }}>
          <Typography variant="caption" color={COLORS.zinc600} style={{ fontSize: 11 }}>
            © {new Date().getFullYear()} RSL Cards. All rights reserved.
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
  heroBox: {
    backgroundColor: "#111111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222222",
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  versionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,87,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,87,255,0.3)",
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  contentCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222222",
    overflow: "hidden",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222222",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingHorizontal: 16,
  },
  linkDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
  },
  linkIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0,87,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
