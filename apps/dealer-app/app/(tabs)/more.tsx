import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useLogout } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/stores/authStore";
import { ExportModal } from "../../src/components/ExportModal";
import {
  usePaymentMethods,
  paymentMethodIcon,
  useFetchOnFocus,
  useUploadAvatar,
  useProfile,
} from "../../src/hooks/useProfile";
// import { UserErrorBoundary } from "../../src/components/ServiceErrorBoundary";

const EBAY_AUTH_URL = process.env.EXPO_PUBLIC_EBAY_AUTH_URL || 'https://auth.ebay.com/oauth2/authorize';
const EBAY_CLIENT_ID = process.env.EXPO_PUBLIC_EBAY_CLIENT_ID;
const EBAY_RU_NAME = process.env.EXPO_PUBLIC_EBAY_RU_NAME;

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
  const isEmoji = !icon || icon.length <= 2 || /\p{Emoji}/u.test(icon);

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={
        onPress ||
        (() => Alert.alert("Coming Soon", "This feature is coming soon!"))
      }
      activeOpacity={0.7}
    >
      {isEmoji ? (
        <Text style={styles.rowIcon}>{icon}</Text>
      ) : (
        <Ionicons
          name={icon as any}
          size={20}
          color="#888888"
          style={{ marginRight: 12, width: 24, textAlign: "center" }}
        />
      )}
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
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadAvatar();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [exportType, setExportType] = useState<"transactions" | "inventory" | null>(null);
  const queryClient = useQueryClient();

  const { data: connectedPlatforms = [] } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: userService.getConnectedPlatforms,
  });

  const disconnectMutation = useMutation({
    mutationFn: (platform: string) => userService.disconnectPlatform(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-platforms'] });
    },
  });

  const handleEbayConnect = async () => {
    if (!EBAY_CLIENT_ID || !EBAY_RU_NAME) {
      Alert.alert('Config Missing', 'eBay Client ID or RU Name not configured.');
      return;
    }

    // Generate a deep link return URL that works perfectly in Expo Go and Production
    const returnUrl = makeRedirectUri({ path: 'oauth/ebay' });

    const userId = user?.id || 'current-user';
    
    // Pass both the userId and the Expo return URL in the state param so the backend knows where to redirect back to
    // Pass both the userId and the Expo return URL in the state param so the backend knows where to redirect back to
    // We avoid JSON or base64 because eBay's sandbox gets confused by special characters
    const stateStr = `${userId}___${returnUrl}`;
    
    const authUrl = `${EBAY_AUTH_URL}?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${EBAY_RU_NAME}&scope=${encodeURIComponent('https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account')}&state=${encodeURIComponent(stateStr)}`;
    
    console.log("Opening eBay Auth:");
    console.log("authUrl:", authUrl);
    console.log("returnUrl:", returnUrl);
    
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
      
      if (result.type === 'success' && result.url.includes('status=success')) {
        queryClient.invalidateQueries({ queryKey: ['connected-platforms'] });
        Alert.alert('Success', 'eBay connected and active listings synced successfully!');
      } else if (result.type === 'success' && result.url.includes('status=error')) {
        const url = new URL(result.url);
        const msg = url.searchParams.get('message') || 'Unknown error';
        Alert.alert('Error', msg);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open eBay login.');
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to change your avatar.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setLocalUri(uri);
      uploadAvatar(uri, {
        onError: (e: any) => {
          setLocalUri(null);
          Alert.alert("Upload failed", e?.message ?? String(e));
        },
      });
    }
  };

  // Only fetch data when screen is focused (user clicks More tab)
  const hasFocused = useFetchOnFocus();

  const { data: profile } = useProfile(hasFocused);
  const { data: paymentMethods } = usePaymentMethods(hasFocused);
  
  const initials = (profile?.displayName ?? user?.displayName ?? user?.email ?? "U")
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
          <TouchableOpacity
            onPress={handlePickAvatar}
            style={styles.profileAvatar}
          >
            {(localUri ?? profile?.photoUrl ?? user?.photoUrl) ? (
              <Image
                source={{ uri: (localUri ?? profile?.photoUrl ?? user?.photoUrl) as string }}
                style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.profileAvatarText}>{initials}</Text>
            )}
            {isUploadingAvatar && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <ActivityIndicator color="white" size="small" />
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={styles.profileName}>
                {profile?.displayName ?? user?.displayName ?? user?.email}
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
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Text style={{ color: "#0057FF", fontSize: 13 }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Business */}
        <Text style={styles.sectionLabel}>BUSINESS</Text>
        <SectionCard>
          <SettingsRow
            icon="people-outline"
            label="Customers"
          />
          <SettingsRow icon="calendar-outline" label="Card Shows" />
          <SettingsRow
            icon="list-outline"
            label="My Listings"
            onPress={() => router.push("/listings/index")}
            isLast
          />
        </SectionCard>

        {/* Platforms */}
        <Text style={styles.sectionLabel}>PLATFORMS</Text>
        <SectionCard>
          {(() => {
            const ebayConnection = connectedPlatforms.find((c: any) => c.platform === 'ebay');
            const isEbayConnected = !!ebayConnection && ebayConnection.isActive;
            return (
              <SettingsRow
                icon="cart-outline"
                label="eBay"
                value={isEbayConnected ? "🟢 Connected" : "⚫ Connect"}
                onPress={() => {
                  if (isEbayConnected) {
                    Alert.alert(
                      "Disconnect eBay?",
                      "This will disconnect your eBay account.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Disconnect", 
                          style: "destructive",
                          onPress: () => disconnectMutation.mutate('ebay')
                        },
                      ]
                    );
                  } else {
                    handleEbayConnect();
                  }
                }}
              />
            );
          })()}
          {(() => {
            const myslabsConnection = connectedPlatforms.find((c: any) => c.platform === 'myslabs');
            const isMyslabsConnected = !!myslabsConnection && myslabsConnection.isActive;
            return (
              <SettingsRow
                icon="albums-outline"
                label="MySlabs"
                value={isMyslabsConnected ? "🟢 Connected" : "⚫ Connect"}
                onPress={() => {
                  if (isMyslabsConnected) {
                    Alert.alert(
                      "Disconnect MySlabs?",
                      "This will disconnect your MySlabs account.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Disconnect", 
                          style: "destructive",
                          onPress: () => disconnectMutation.mutate('myslabs')
                        },
                      ]
                    );
                  } else {
                    Alert.alert("Coming Soon", "MySlabs connection is not yet implemented.");
                  }
                }}
                isLast
              />
            );
          })()}
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

        <Text style={styles.sectionLabel}>DATA & EXPORTS</Text>
        <SectionCard>
          <SettingsRow icon="document-text-outline" label="Export Transactions (CSV)" onPress={() => setExportType("transactions")} />
          <SettingsRow icon="cube-outline" label="Export Inventory (CSV)" onPress={() => setExportType("inventory")} />
          <SettingsRow icon="cash-outline" label="Tax Report (PDF)" isLast />
        </SectionCard>

        {/* App */}
        <Text style={styles.sectionLabel}>APP</Text>
        <SectionCard>
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push("/settings")}
          />
          <SettingsRow icon="help-circle-outline" label="Help & Support" />
          <SettingsRow icon="information-circle-outline" label="About RSL Cards" />
          <SettingsRow icon="phone-portrait-outline" label="Version" value="1.0.0" isLast />
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

      {/* Export Modal */}
      {exportType && (
        <ExportModal
          visible={!!exportType}
          type={exportType}
          onClose={() => setExportType(null)}
        />
      )}
    </SafeAreaView>
  );
}

// Export without error boundary
export default MoreScreen;

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
    overflow: "hidden",
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
