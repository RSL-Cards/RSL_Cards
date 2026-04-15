import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useRegister } from "../../src/hooks/useAuth";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isDealer, setIsDealer] = useState(true);
  const [validationError, setValidationError] = useState("");

  const { mutate: register, isPending, error } = useRegister();

  const apiError = error
    ? (error as any)?.response?.data?.message ||
      "Registration failed. Please try again."
    : null;
  const displayError = validationError || apiError;

  const handleRegister = () => {
    if (!email || !password || !confirm) {
      setValidationError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setValidationError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }
    setValidationError("");
    register({
      email: email.trim().toLowerCase(),
      password,
      role: isDealer ? "dealer" : "consumer",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start tracking your deals today</Text>

            <View style={styles.form}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#555555"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ height: 20 }} />
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#555555"
                secureTextEntry
              />

              <View style={{ height: 20 }} />
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="••••••••"
                placeholderTextColor="#555555"
                secureTextEntry
              />

              <View style={{ height: 24 }} />
              <Text style={styles.label}>ROLE</Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.roleChip, isDealer && styles.roleChipActive]}
                  onPress={() => setIsDealer(true)}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      isDealer && styles.roleChipTextActive,
                    ]}
                  >
                    I'm a Dealer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleChip, !isDealer && styles.roleChipActive]}
                  onPress={() => setIsDealer(false)}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      !isDealer && styles.roleChipTextActive,
                    ]}
                  >
                    I'm a Collector
                  </Text>
                </TouchableOpacity>
              </View>

              {displayError ? (
                <Text style={styles.errorText}>{displayError}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={handleRegister}
                disabled={isPending}
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.registerBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginRow}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={{ color: "#0057FF" }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  backBtn: { paddingHorizontal: 20, paddingTop: 12 },
  backText: { color: "white", fontSize: 18 },
  content: { paddingHorizontal: 24, paddingTop: 40, flex: 1 },
  title: { fontSize: 28, fontWeight: "700", color: "white" },
  subtitle: { color: "#888888", fontSize: 14, marginTop: 8 },
  form: { marginTop: 40 },
  label: {
    fontSize: 12,
    color: "#888888",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: "white",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  roleChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: "#1A1A1A",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
  },
  roleChipActive: { backgroundColor: "#0057FF", borderColor: "#0057FF" },
  roleChipText: { color: "#888888", fontWeight: "600", fontSize: 14 },
  roleChipTextActive: { color: "white" },
  registerBtn: {
    marginTop: 32,
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  registerBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  loginRow: { alignItems: "center", marginTop: 32, marginBottom: 24 },
  loginText: { color: "#888888", fontSize: 14 },
  errorText: {
    color: "#E8001C",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
});
