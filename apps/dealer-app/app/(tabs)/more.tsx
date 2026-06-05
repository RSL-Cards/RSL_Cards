import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
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
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";
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
        <Typography variant="h3" style={styles.rowIcon}>{icon}</Typography>
      ) : (
        <Ionicons
          name={icon as any}
          size={20}
          color={COLORS.zinc400}
          style={{ marginRight: 12, width: 24, textAlign: "center" }}
        />
      )}
      <Typography variant="body" weight="600" style={[{ flex: 1 }, accentColor && { color: accentColor }]}>
        {label}
      </Typography>
      {value && <Typography variant="caption" color={COLORS.zinc400} style={styles.rowValue}>{value}</Typography>}
      {!accentColor && <Typography variant="h3" color={COLORS.zinc600}>›</Typography>}
    </TouchableOpacity>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <Surface variant="elevated" padding="none" style={styles.sectionCard}>{children}</Surface>;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.header}>
          <Typography variant="h1" weight="800">More</Typography>
        </View>

        {/* Profile card */}
        <Surface variant="glass" style={styles.profileCard}>
          <TouchableOpacity
            onPress={handlePickAvatar}
            style={styles.profileAvatar}
          >
            {(localUri ?? profile?.photoUrl ?? user?.photoUrl) ? (
              <Image
                source={{ uri: (localUri ?? profile?.photoUrl ?? user?.photoUrl) as string }}
                style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
                resizeMode="cover"
              />
            ) : (
              <Typography variant="h3" weight="800" color={COLORS.white}>{initials}</Typography>
            )}
            {isUploadingAvatar && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <ActivityIndicator color={COLORS.white} size="small" />
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Typography variant="body" weight="800">
                {profile?.displayName ?? user?.displayName ?? user?.email}
              </Typography>
              <View style={styles.proBadge}>
                <Typography variant="caption" weight="800" color={COLORS.primaryLight} style={{ fontSize: 9 }}>
                  {user?.role?.toUpperCase()}
                </Typography>
              </View>
            </View>
            <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 2 }}>{user?.email}</Typography>
          </View>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Typography variant="body" weight="700" color={COLORS.primaryLight}>Edit</Typography>
          </TouchableOpacity>
        </Surface>

        {/* Business */}
        <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>BUSINESS</Typography>
        <SectionCard>
          <SettingsRow
            icon="people-outline"
            label="Customers"
          />
          <SettingsRow icon="calendar-outline" label="Card Shows" />
          <SettingsRow
            icon="list-outline"
            label="My Listings"
            onPress={() => router.push("/listings")}
            isLast
          />
        </SectionCard>

        {/* Platforms */}
        <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>PLATFORMS</Typography>
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
            <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>PAYMENTS</Typography>
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

        <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>DATA & EXPORTS</Typography>
        <SectionCard>
          <SettingsRow icon="document-text-outline" label="Export Transactions (CSV)" onPress={() => setExportType("transactions")} />
          <SettingsRow icon="cube-outline" label="Export Inventory (CSV)" onPress={() => setExportType("inventory")} />
          <SettingsRow icon="cash-outline" label="Tax Report (PDF)" isLast />
        </SectionCard>

        {/* App */}
        <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>APP</Typography>
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
          <Typography variant="body" weight="800" color={COLORS.destructive}>Sign Out</Typography>
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
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.destructive,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  proBadge: {
    backgroundColor: 'rgba(79,70,229,0.15)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.3)',
  },
  sectionLabel: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: SPACING.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowIcon: { marginRight: 12, width: 26 },
  rowValue: { marginRight: 8 },
  logoutBtn: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
});
