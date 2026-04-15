import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../../src/stores/onboardingStore";
import { useCompleteOnboarding } from "../../../src/hooks/useAuth";

const PAYMENT_PLATFORMS = [
  {
    key: "venmo",
    label: "Venmo",
    icon: "V",
    iconBg: "#5C27D9",
    placeholder: "@handle",
  },
  {
    key: "cashapp",
    label: "CashApp",
    icon: "$",
    iconBg: "#00C853",
    placeholder: "$cashtag",
  },
  {
    key: "zelle",
    label: "Zelle",
    icon: "Z",
    iconBg: "#6E00FF",
    placeholder: "Phone or email",
  },
  {
    key: "paypal",
    label: "PayPal",
    icon: "P",
    iconBg: "#003087",
    placeholder: "Email",
  },
];

export default function PaymentSetupScreen() {
  const router = useRouter();
  const sports = useOnboardingStore((s) => s.sports);
  const sellChannels = useOnboardingStore((s) => s.sellChannels);
  const [handles, setHandles] = useState<Record<string, string>>({});

  const { mutate: submit, isPending, error } = useCompleteOnboarding();

  const handleContinue = () => {
    const paymentMethods = PAYMENT_PLATFORMS.filter((p) =>
      handles[p.key]?.trim(),
    ).map((p) => ({ type: p.key as any, handle: handles[p.key].trim() }));
    submit({ sports, sellChannels, paymentMethods });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Set up payments</Text>
          <Text style={styles.subtitle}>
            Generate QR codes instantly during sales
          </Text>

          <View style={styles.cardsContainer}>
            {PAYMENT_PLATFORMS.map((p) => (
              <View key={p.key} style={styles.paymentCard}>
                <View
                  style={[styles.iconCircle, { backgroundColor: p.iconBg }]}
                >
                  <Text style={styles.iconText}>{p.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.platformLabel}>{p.label}</Text>
                  <TextInput
                    style={styles.platformInput}
                    placeholder={p.placeholder}
                    placeholderTextColor="#555555"
                    value={handles[p.key] || ""}
                    onChangeText={(v) =>
                      setHandles((prev) => ({ ...prev, [p.key]: v }))
                    }
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        {error ? (
          <Text style={styles.errorText}>
            {(error as any)?.response?.data?.message ||
              "Failed to save. Try again."}
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={handleContinue}
          style={{ alignItems: "center", marginBottom: 12 }}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.continueBtnText}>Continue →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  progressBar: { height: 3, backgroundColor: "#1A1A1A", marginTop: 8 },
  progressFill: { width: "75%", height: 3, backgroundColor: "#E8001C" },
  content: { paddingHorizontal: 24, paddingTop: 40, flex: 1 },
  title: { fontSize: 24, fontWeight: "700", color: "white" },
  subtitle: { color: "#888888", fontSize: 14, marginTop: 8 },
  cardsContainer: { marginTop: 32, gap: 12 },
  paymentCard: {
    backgroundColor: "#111111",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: "white", fontWeight: "700", fontSize: 18 },
  platformLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
  },
  platformInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    height: 38,
    paddingHorizontal: 12,
    color: "white",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 32 },
  skipText: { color: "#555555", fontSize: 14 },
  errorText: {
    color: "#E8001C",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  continueBtn: {
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
