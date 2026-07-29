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
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useLogout } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/stores/authStore";
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
import { CustomAlertModal } from "../../src/components/ui/CustomAlertModal";

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
  const isClickable = !!onPress;

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      disabled={!isClickable}
      activeOpacity={isClickable ? 0.7 : 1}
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
      {isClickable && !accentColor && <Typography variant="h3" color={COLORS.zinc600}>›</Typography>}
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
  const [showEbayModal, setShowEbayModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDisconnectEbayModal, setShowDisconnectEbayModal] = useState(false);
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

    const returnUrl = makeRedirectUri({ path: 'oauth/ebay' });
    const userId = user?.id || 'current-user';
    const stateStr = `${userId}___${returnUrl}`;
    
    const authUrl = `${EBAY_AUTH_URL}?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${EBAY_RU_NAME}&scope=${encodeURIComponent('https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account')}&state=${encodeURIComponent(stateStr)}`;
    
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
    setShowLogoutModal(true);
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
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

        {/* Platforms */}
        <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>MARKETPLACE CONNECTIONS</Typography>
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
                    setShowDisconnectEbayModal(true);
                  } else {
                    setShowEbayModal(true);
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
            <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>PAYMENT METHODS</Typography>
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

        {/* App */}
        <Typography variant="label" color={COLORS.zinc500} style={styles.sectionLabel}>SUPPORT & SETTINGS</Typography>
        <SectionCard>
          <SettingsRow
            icon="notifications-outline"
            label="Notification Preferences"
            onPress={() => router.push("/notifications/preferences")}
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => router.push("/about")}
          />
          <SettingsRow
            icon="document-text-outline"
            label="Privacy & Terms"
            onPress={() => router.push("/about")}
          />
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

      {/* eBay Connection Features Modal */}
      <Modal
        visible={showEbayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEbayModal(false)}
      >
        <Pressable style={modalStyles.overlay} onPress={() => setShowEbayModal(false)}>
          <Pressable style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Ionicons name="cart" size={26} color="#E53238" />
              <Text style={modalStyles.title}>eBay Integration (Coming Soon)</Text>
            </View>

            <View style={modalStyles.devBadge}>
              <Text style={modalStyles.devBadgeText}>🛠️ Under Active Development</Text>
            </View>

            <Text style={modalStyles.subtitle}>
              We are actively developing native eBay integration! The following features will take place shortly:
            </Text>

            <View style={modalStyles.featureList}>
              <View style={modalStyles.featureRow}>
                <Text style={modalStyles.featureIcon}>📦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.featureTitle}>Automatic Inventory Sync</Text>
                  <Text style={modalStyles.featureDesc}>Imports & syncs active eBay listings into RSL Card inventory.</Text>
                </View>
              </View>

              <View style={modalStyles.featureRow}>
                <Text style={modalStyles.featureIcon}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.featureTitle}>Real-Time Market Comps</Text>
                  <Text style={modalStyles.featureDesc}>Fetches live eBay active & sold price comps for accurate valuation.</Text>
                </View>
              </View>

              <View style={modalStyles.featureRow}>
                <Text style={modalStyles.featureIcon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.featureTitle}>One-Click Cross-Posting</Text>
                  <Text style={modalStyles.featureDesc}>Instantly publish inventory items directly to your eBay store.</Text>
                </View>
              </View>

              <View style={modalStyles.featureRow}>
                <Text style={modalStyles.featureIcon}>💰</Text>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.featureTitle}>Automated Sales & P&L Log</Text>
                  <Text style={modalStyles.featureDesc}>Automatically tracks completed eBay sales in your daily log.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={modalStyles.connectBtn}
              onPress={() => setShowEbayModal(false)}
            >
              <Text style={modalStyles.connectBtnText}>Got It, Thanks!</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sign Out Custom Alert Modal */}
      <CustomAlertModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your dealer account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        iconName="log-out-outline"
        variant="danger"
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Disconnect eBay Custom Alert Modal */}
      <CustomAlertModal
        visible={showDisconnectEbayModal}
        title="Disconnect eBay?"
        message="This will disconnect your active eBay marketplace integration."
        confirmText="Disconnect"
        cancelText="Cancel"
        iconName="link-outline"
        variant="danger"
        onConfirm={() => {
          setShowDisconnectEbayModal(false);
          disconnectMutation.mutate('ebay');
        }}
        onCancel={() => setShowDisconnectEbayModal(false)}
      />
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    backgroundColor: "#161618",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2D2D30",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  devBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(230, 81, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(230, 81, 0, 0.4)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  devBadgeText: {
    color: "#FF9800",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    color: "#888888",
    fontSize: 13,
    marginBottom: 20,
  },
  featureList: {
    gap: 16,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  featureDesc: {
    color: "#888888",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  connectBtn: {
    backgroundColor: "#E53238",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  connectBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "600",
  },
});

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
