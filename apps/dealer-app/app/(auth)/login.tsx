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
import { useLogin } from "../../src/hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const { mutate: login, isPending, error } = useLogin();

  const errorMsg = error
    ? (error as any)?.response?.data?.message || "Invalid email or password"
    : null;

  const handleSignIn = () => {
    if (!email || !password) return;
    login({ email: email.trim().toLowerCase(), password });
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
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Welcome back, dealer</Text>

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
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#555555"
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPw(!showPw)}
                >
                  <Text style={{ color: "#555555", fontSize: 18 }}>
                    {showPw ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.signInBtn}
                onPress={handleSignIn}
                disabled={isPending}
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signInBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.createRow}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.createText}>
                Don't have an account?{" "}
                <Text style={{ color: "#0057FF" }}>Create one</Text>
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
  passwordRow: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  eyeBtn: { position: "absolute", right: 14, zIndex: 1 },
  forgotBtn: { alignSelf: "flex-end", marginTop: 10 },
  forgotText: { color: "#0057FF", fontSize: 13 },
  errorText: {
    color: "#E8001C",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  signInBtn: {
    marginTop: 32,
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signInBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  createRow: { alignItems: "center", marginTop: 32 },
  createText: { color: "#888888", fontSize: 14 },
});
