import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../../src/hooks/useProfile";
import { useAuthStore } from "../../src/stores/authStore";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";

const SPORTS = [
  "Football",
  "Baseball",
  "Basketball",
  "Hockey",
  "Soccer",
  "MMA",
];
const PAYMENT_TYPES = [
  { key: "venmo", icon: "wallet-outline", color: "#008CFF", label: "Venmo", placeholder: "@handle" },
  { key: "cashapp", icon: "logo-usd", color: "#00D632", label: "CashApp", placeholder: "$cashtag" },
  { key: "zelle", icon: "card-outline", color: "#6C1CD1", label: "Zelle", placeholder: "Phone/Email" },
  { key: "paypal", icon: "logo-paypal", color: "#003087", label: "PayPal", placeholder: "Email" },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadAvatar();
  const [localUri, setLocalUri] = useState<string | null>(null);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to change your profile picture.",
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
        onSuccess: () =>
          Toast.show({ type: "success", text1: "Profile picture updated" }),
        onError: () => {
          setLocalUri(null);
          Toast.show({
            type: "error",
            text1: "Upload failed",
            text2: "Please try again",
          });
        },
      });
    }
  };

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [pmHandles, setPmHandles] = useState<Record<string, string>>({
    venmo: "",
    cashapp: "",
    zelle: "",
    paypal: "",
  });

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setBio(profile.bio ?? "");
    setPhone(profile.phone ?? "");
    const sports = (profile.sports ?? []).map(
      (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    );
    setSelectedSports(sports);
    const handles: Record<string, string> = {
      venmo: "",
      cashapp: "",
      zelle: "",
      paypal: "",
    };
    for (const pm of profile.paymentMethods ?? []) {
      handles[pm.type] = pm.handle;
    }
    setPmHandles(handles);
  }, [profile]);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const handleSave = () => {
    const paymentMethods = PAYMENT_TYPES.filter((pt) =>
      pmHandles[pt.key]?.trim(),
    ).map((pt) => ({ type: pt.key, handle: pmHandles[pt.key].trim() }));

    updateProfile(
      {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        sports: selectedSports.map((s) => s.toLowerCase()),
        paymentMethods,
      },
      {
        onSuccess: () =>
          Toast.show({ type: "success", text1: "Profile updated" }),
        onError: () =>
          Toast.show({
            type: "error",
            text1: "Failed to save",
            text2: "Please try again",
          }),
      },
    );
  };

  const initials = (
    profile?.displayName ??
    user?.displayName ??
    user?.email ??
    "U"
  )
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator color={COLORS.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Typography variant="h1" weight="400">‹</Typography>
        </TouchableOpacity>
        <Typography variant="h2" weight="700">Settings</Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile section */}
        <Text style={styles.sectionLabel}>PROFILE</Text>
        <View style={styles.sectionCard}>
          <View style={styles.avatarRow}>
            <TouchableOpacity
              onPress={handlePickAvatar}
              style={styles.avatarWrap}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                {(localUri ?? user?.photoUrl) ? (
                  <Image
                    source={{ uri: (localUri ?? user?.photoUrl) as string }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
                {isUploadingAvatar && (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: "rgba(0,0,0,0.55)",
                        borderRadius: 28,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <ActivityIndicator color="white" size="small" />
                  </View>
                )}
              </View>
              {!isUploadingAvatar && (
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Typography variant="body" weight="700">
                {profile?.displayName ?? user?.email}
              </Typography>
              <Typography variant="caption" color={COLORS.zinc400} style={{ marginTop: 2 }}>
                {(profile?.subscriptionPlan ?? "free").toUpperCase()} plan
              </Typography>
              <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 4 }}>
                Tap photo to change
              </Typography>
            </View>
          </View>

          <View style={styles.fieldDivider} />

          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.fieldInput}
            value={displayName}
            onChangeText={setDisplayName}
            placeholderTextColor={COLORS.zinc500}
            placeholder="Your name"
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>EMAIL</Text>
          <TextInput
            style={[styles.fieldInput, { color: COLORS.zinc500 }]}
            value={user?.email ?? ""}
            editable={false}
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>PHONE</Text>
          <TextInput
            style={styles.fieldInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="(optional)"
            placeholderTextColor={COLORS.zinc500}
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>BIO</Text>
          <TextInput
            style={[
              styles.fieldInput,
              { height: 80, paddingTop: 12, textAlignVertical: "top" },
            ]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Tell buyers about yourself..."
            placeholderTextColor={COLORS.zinc500}
          />
        </View>

        {/* Sports preferences */}
        <Text style={styles.sectionLabel}>SPORTS PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <View style={styles.chipsGrid}>
            {SPORTS.map((sport) => {
              const isSelected = selectedSports.includes(sport);
              return (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportChip,
                    isSelected && styles.sportChipSelected,
                  ]}
                  onPress={() => toggleSport(sport)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.sportChipText,
                      isSelected && styles.sportChipTextSelected,
                    ]}
                  >
                    {sport}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Payment methods */}
        <Text style={styles.sectionLabel}>PAYMENT HANDLES</Text>
        <View style={styles.sectionCard}>
          {PAYMENT_TYPES.map((pm, i) => (
            <View
              key={pm.key}
              style={[
                styles.paymentRow,
                i < PAYMENT_TYPES.length - 1 && styles.rowBorder,
              ]}
            >
              <Ionicons name={pm.icon as any} size={20} color={pm.color} style={{ marginRight: 12 }} />
              <Text style={styles.paymentLabel}>{pm.label}</Text>
              <TextInput
                style={styles.paymentInput}
                value={pmHandles[pm.key]}
                onChangeText={(v) =>
                  setPmHandles((prev) => ({ ...prev, [pm.key]: v }))
                }
                placeholder={pm.placeholder}
                placeholderTextColor={COLORS.zinc500}
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, isPending && { opacity: 0.6 }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  sectionLabel: {
    color: COLORS.zinc500,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    padding: SPACING.md,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.xs },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cameraIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.zinc900,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  fieldDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  fieldLabel: {
    color: COLORS.zinc500,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  fieldInput: {
    backgroundColor: COLORS.zinc900,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.zinc900,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  sportChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sportChipText: { color: COLORS.zinc400, fontSize: 13, fontWeight: "600" },
  sportChipTextSelected: { color: COLORS.text },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  paymentLabel: { color: COLORS.text, fontWeight: "600", fontSize: 14, width: 70 },
  paymentInput: { flex: 1, color: COLORS.text, fontSize: 14, textAlign: "right" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: COLORS.text, fontWeight: "700", fontSize: 16 },
});
