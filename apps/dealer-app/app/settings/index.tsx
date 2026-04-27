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

const SPORTS = [
  "Football",
  "Baseball",
  "Basketball",
  "Hockey",
  "Soccer",
  "MMA",
];
const PAYMENT_TYPES = [
  { key: "venmo", icon: "💜", label: "Venmo", placeholder: "@handle" },
  { key: "cashapp", icon: "💚", label: "CashApp", placeholder: "$cashtag" },
  { key: "zelle", icon: "💙", label: "Zelle", placeholder: "Phone/Email" },
  { key: "paypal", icon: "🅿️", label: "PayPal", placeholder: "Email" },
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
        <ActivityIndicator color="#E8001C" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
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
                  <Text style={{ fontSize: 11 }}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                {profile?.displayName ?? user?.email}
              </Text>
              <Text style={{ color: "#888888", fontSize: 13, marginTop: 2 }}>
                {(profile?.subscriptionPlan ?? "free").toUpperCase()} plan
              </Text>
              <Text style={{ color: "#555555", fontSize: 11, marginTop: 4 }}>
                Tap photo to change
              </Text>
            </View>
          </View>

          <View style={styles.fieldDivider} />

          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.fieldInput}
            value={displayName}
            onChangeText={setDisplayName}
            placeholderTextColor="#555555"
            placeholder="Your name"
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>EMAIL</Text>
          <TextInput
            style={[styles.fieldInput, { color: "#555555" }]}
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
            placeholderTextColor="#555555"
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
            placeholderTextColor="#555555"
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
              <Text style={{ fontSize: 20, marginRight: 12 }}>{pm.icon}</Text>
              <Text style={styles.paymentLabel}>{pm.label}</Text>
              <TextInput
                style={styles.paymentInput}
                value={pmHandles[pm.key]}
                onChangeText={(v) =>
                  setPmHandles((prev) => ({ ...prev, [pm.key]: v }))
                }
                placeholder={pm.placeholder}
                placeholderTextColor="#555555"
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
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backText: { color: "white", fontSize: 28 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "700" },
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
    padding: 16,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8001C",
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
    backgroundColor: "#1A1A1A",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "white", fontSize: 20, fontWeight: "700" },
  fieldDivider: { height: 1, backgroundColor: "#2A2A2A", marginVertical: 16 },
  fieldLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "white",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  chipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "#1A1A1A",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
  },
  sportChipSelected: { backgroundColor: "#E8001C", borderColor: "#E8001C" },
  sportChipText: { color: "#888888", fontSize: 13, fontWeight: "600" },
  sportChipTextSelected: { color: "white" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  paymentLabel: { color: "white", fontWeight: "600", fontSize: 14, width: 70 },
  paymentInput: { flex: 1, color: "white", fontSize: 14, textAlign: "right" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  toggleLabel: { color: "white", fontSize: 15, fontWeight: "600" },
  toggleSub: { color: "#888888", fontSize: 12, marginTop: 2 },
  statusText: { fontSize: 12, fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  saveBtn: {
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
