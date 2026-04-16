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
import { useForgotPassword, useResetPassword } from "../../src/hooks/useAuth";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { mutate: sendOtp, isPending: isSendingOtp, error: sendError } = useForgotPassword();
  const { mutate: resetPassword, isPending: isResetting, error: resetError } = useResetPassword();

  const handleSendOtp = () => {
    if (!email) return;
    sendOtp(
      { email: email.trim().toLowerCase() },
      {
        onSuccess: () => {
          setStep("otp");
        },
      }
    );
  };

  const handleResetPassword = () => {
    if (!otp || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    if (newPassword.length < 8) return;

    resetPassword(
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      },
      {
        onSuccess: () => {
          router.replace("/(auth)/login");
        },
      }
    );
  };

  const isPending = isSendingOtp || isResetting;
  const errorMsg = sendError || resetError
    ? ((sendError as any)?.response?.data?.message || (resetError as any)?.response?.data?.message || "Something went wrong")
    : null;

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
            <Text style={styles.title}>
              {step === "email" ? "Forgot Password" : "Enter OTP"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "email"
                ? "Enter your email to receive a reset code"
                : `We sent a 6-digit code to ${email}`}
            </Text>

            <View style={styles.form}>
              {step === "email" ? (
                <>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#555555"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isPending}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>6-DIGIT OTP CODE</Text>
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="000000"
                    placeholderTextColor="#555555"
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isPending}
                  />

                  <View style={{ height: 20 }} />

                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, paddingRight: 48 }]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#555555"
                      secureTextEntry={!showPw}
                      editable={!isPending}
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

                  <View style={{ height: 20 }} />

                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, paddingRight: 48 }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#555555"
                      secureTextEntry={!showConfirmPw}
                      editable={!isPending}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowConfirmPw(!showConfirmPw)}
                    >
                      <Text style={{ color: "#555555", fontSize: 18 }}>
                        {showConfirmPw ? "🙈" : "👁"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <Text style={styles.hintText}>Passwords do not match</Text>
                  )}
                  {newPassword && newPassword.length < 8 && (
                    <Text style={styles.hintText}>Password must be at least 8 characters</Text>
                  )}
                </>
              )}

              {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  (step === "email" ? !email : !otp || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8) &&
                    styles.actionBtnDisabled,
                ]}
                onPress={step === "email" ? handleSendOtp : handleResetPassword}
                disabled={isPending || (step === "email" ? !email : !otp || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8)}
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.actionBtnText}>
                    {step === "email" ? "Send OTP" : "Reset Password"}
                  </Text>
                )}
              </TouchableOpacity>

              {step === "otp" && (
                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={() => setStep("email")}
                  disabled={isPending}
                >
                  <Text style={styles.resendText}>← Use different email</Text>
                </TouchableOpacity>
              )}
            </View>
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
  errorText: {
    color: "#E8001C",
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
  },
  hintText: {
    color: "#E8001C",
    fontSize: 13,
    marginTop: 8,
  },
  actionBtn: {
    marginTop: 32,
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDisabled: {
    backgroundColor: "#4A0008",
  },
  actionBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  resendBtn: { alignSelf: "center", marginTop: 20 },
  resendText: { color: "#0057FF", fontSize: 14 },
});
