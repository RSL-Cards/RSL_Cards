import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useLogout } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/stores/authStore";
import {
  usePaymentMethods,
  paymentMethodIcon,
  useFetchOnFocus,
} from "../../src/hooks/useProfile";
import { UserErrorBoundary } from "../../src/components/ServiceErrorBoundary";

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isLast,
  accentColor,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  accentColor?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={
        onPress ||
        (() => Alert.alert("Coming Soon", "This feature is coming soon!"))
      }
      activeOpacity={0.7}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, accentColor && { color: accentColor }]}>
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {!accentColor && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function MoreScreen() {
  const router = useRouter();
  const { mutate: logout } = useLogout();
  const user = useAuthStore((s) => s.user);

  // Only fetch data when screen is focused (user clicks More tab)
  const hasFocused = useFetchOnFocus();

  const { data: paymentMethods } = usePaymentMethods(hasFocused);
  const initials = (user?.displayName ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={styles.profileName}>
                {user?.displayName ?? user?.email}
              </Text>
              <View
                style={[
                  styles.proBadge,
                  { backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" },
                ]}
              >
                <Text style={[styles.proBadgeText, { color: "#888888" }]}>
                  {user?.role?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/settings/index")}>
            <Text style={{ color: "#0057FF", fontSize: 13 }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Business */}
        <Text style={styles.sectionLabel}>BUSINESS</Text>
        <SectionCard>
          <SettingsRow
            icon="👥"
            label="Customers"
            onPress={() => router.push("/customers/index")}
          />
          <SettingsRow icon="📅" label="Card Shows" />
          <SettingsRow
            icon="📋"
            label="My Listings"
            onPress={() => router.push("/listings/index")}
            isLast
          />
        </SectionCard>

        {/* Platforms */}
        <Text style={styles.sectionLabel}>PLATFORMS</Text>
        <SectionCard>
          <SettingsRow
            icon="🛒"
            label="eBay"
            value="⚫ Connect"
            onPress={() =>
              router.push("/settings/connect-platform?platform=ebay")
            }
          />
          <SettingsRow
            icon="📺"
            label="Whatnot"
            value="⚫ Connect"
            onPress={() =>
              router.push("/settings/connect-platform?platform=whatnot")
            }
          />
          <SettingsRow
            icon="🎮"
            label="TCGPlayer"
            value="⚫ Connect"
            onPress={() =>
              router.push("/settings/connect-platform?platform=tcgplayer")
            }
          />
          <SettingsRow
            icon="🏪"
            label="Shopify"
            value="⚫ Connect"
            onPress={() =>
              router.push("/settings/connect-platform?platform=shopify")
            }
            isLast
          />
        </SectionCard>

        {/* Payments */}
        {paymentMethods && paymentMethods.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>PAYMENTS</Text>
            <SectionCard>
              {paymentMethods.map((pm, i) => (
                <SettingsRow
                  key={pm.id}
                  icon={paymentMethodIcon(pm.type)}
                  label={pm.type.charAt(0).toUpperCase() + pm.type.slice(1)}
                  value={pm.handle}
                  isLast={i === paymentMethods.length - 1}
                />
              ))}
            </SectionCard>
          </>
        )}

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA & EXPORTS</Text>
        <SectionCard>
          <SettingsRow icon="📄" label="Export Transactions (CSV)" />
          <SettingsRow icon="📦" label="Export Inventory (CSV)" />
          <SettingsRow icon="💰" label="Tax Report (PDF)" isLast />
        </SectionCard>

        {/* App */}
        <Text style={styles.sectionLabel}>APP</Text>
        <SectionCard>
          <SettingsRow
            icon="🔔"
            label="Notifications"
            onPress={() => router.push("/settings/index")}
          />
          <SettingsRow icon="❓" label="Help & Support" />
          <SettingsRow icon="ℹ️" label="About RSL Cards" />
          <SettingsRow icon="📱" label="Version" value="1.0.0" isLast />
        </SectionCard>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Export wrapped with error boundary
export default function MoreScreenWithBoundary() {
  return (
    <UserErrorBoundary>
      <MoreScreen />
    </UserErrorBoundary>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "white" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8001C",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: { color: "white", fontSize: 20, fontWeight: "700" },
  profileName: { color: "white", fontSize: 16, fontWeight: "700" },
  profileEmail: { color: "#888888", fontSize: 13, marginTop: 2 },
  proBadge: {
    backgroundColor: "rgba(255,215,0,0.15)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
  },
  proBadgeText: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  sectionLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  rowIcon: { fontSize: 18, marginRight: 12, width: 26 },
  rowLabel: { color: "white", fontSize: 15, fontWeight: "500", flex: 1 },
  rowValue: { color: "#888888", fontSize: 13, marginRight: 8 },
  chevron: { color: "#2A2A2A", fontSize: 20 },
  logoutBtn: {
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  logoutText: { color: "#E8001C", fontSize: 16, fontWeight: "700" },
});
