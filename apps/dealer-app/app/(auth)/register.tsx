import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
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
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useRegister, useSendOtp, useGoogleAuth, useAppleAuth } from "../../src/hooks/useAuth";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(300);

  const { mutate: register, isPending: isRegistering, error: registerError } = useRegister();
  const { mutate: sendOtp, isPending: isSendingOtp, error: sendOtpError } = useSendOtp();
  const { promptGoogleSignIn } = useGoogleAuth();
  const { signInWithApple } = useAppleAuth();

  const handleGoogleSignIn = () => {
    if (!acceptedTerms) {
      setValidationError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    setValidationError("");
    promptGoogleSignIn();
  };

  const handleAppleSignIn = () => {
    if (!acceptedTerms) {
      setValidationError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    setValidationError("");
    signInWithApple();
  };

  useEffect(() => {
    let interval: any = null;
    if (step === "otp" && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const apiError =
    (sendOtpError as any)?.response?.data?.message ||
    (registerError as any)?.response?.data?.message ||
    null;
  const displayError = validationError || apiError;

  const handleSendOtpStep = () => {
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
    if (!acceptedTerms) {
      setValidationError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    setValidationError("");

    sendOtp(
      { email: email.trim().toLowerCase() },
      {
        onSuccess: () => {
          setStep("otp");
          setTimerSeconds(300);
        },
      }
    );
  };

  const handleFinalRegister = () => {
    if (!otp || otp.length !== 6) {
      setValidationError("Please enter the 6-digit OTP code.");
      return;
    }
    setValidationError("");
    register({
      email: email.trim().toLowerCase(),
      password,
      role: "dealer",
      otp: otp.trim(),
    });
  };

  const handleResendOtp = () => {
    setValidationError("");
    sendOtp(
      { email: email.trim().toLowerCase() },
      {
        onSuccess: () => {
          setTimerSeconds(300);
        },
      }
    );
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
            onPress={() => {
              if (step === "otp") {
                setStep("details");
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>
              {step === "details" ? "Create Account" : "Verify Your Email"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "details"
                ? "Start tracking your deals today"
                : `We sent a 6-digit code to ${email}`}
            </Text>

            {step === "details" ? (
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
                    <Ionicons
                      name={showPw ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#888888"
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
                <Text style={styles.label}>CONFIRM PASSWORD</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, paddingRight: 48 }]}
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="••••••••"
                    placeholderTextColor="#555555"
                    secureTextEntry={!showConfirmPw}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPw(!showConfirmPw)}
                  >
                    <Ionicons
                      name={showConfirmPw ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#888888"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                    {acceptedTerms && <Ionicons name="checkmark-sharp" size={15} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{" "}
                    <Text
                      style={styles.termsLink}
                      onPress={(e) => {
                        e.stopPropagation();
                        Linking.openURL("https://rslcards.com/terms&conditions");
                      }}
                    >
                      Terms &amp; Conditions
                    </Text>{" "}
                    and{" "}
                    <Text
                      style={styles.termsLink}
                      onPress={(e) => {
                        e.stopPropagation();
                        Linking.openURL("https://rslcards.com/privacy-policy");
                      }}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </TouchableOpacity>

                {displayError ? (
                  <Text style={styles.errorText}>{displayError}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.registerBtn}
                  onPress={handleSendOtpStep}
                  disabled={isSendingOtp}
                  activeOpacity={0.85}
                >
                  {isSendingOtp ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.registerBtnText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    marginTop: 12,
                    backgroundColor: "#1A1A1A",
                    height: 52,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#333333",
                  }}
                  onPress={handleGoogleSignIn}
                  activeOpacity={0.85}
                >
                  <AntDesign name="google" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
                  <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                    Sign Up with Google
                  </Text>
                </TouchableOpacity>

                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={{
                      marginTop: 12,
                      backgroundColor: "#1A1A1A",
                      height: 52,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#333333",
                    }}
                    onPress={handleAppleSignIn}
                    activeOpacity={0.85}
                  >
                    <AntDesign name="apple" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
                    <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                      Sign Up with Apple
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.label}>ENTER 6-DIGIT VERIFICATION CODE</Text>
                <TextInput
                  style={[styles.input, { letterSpacing: 8, textAlign: "center", fontSize: 22 }]}
                  value={otp}
                  onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="123456"
                  placeholderTextColor="#555555"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />

                <View style={styles.timerRow}>
                  <Text style={styles.timerText}>
                    Code expires in:{" "}
                    <Text style={{ color: "#E8001C", fontWeight: "700" }}>
                      {formatTimer(timerSeconds)}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={isSendingOtp || timerSeconds > 240}
                  >
                    <Text style={{ color: timerSeconds > 240 ? "#555" : "#0057FF", fontWeight: "600" }}>
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                </View>

                {displayError ? (
                  <Text style={styles.errorText}>{displayError}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.registerBtn}
                  onPress={handleFinalRegister}
                  disabled={isRegistering}
                  activeOpacity={0.85}
                >
                  {isRegistering ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.registerBtnText}>Verify & Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

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
  passwordRow: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  eyeBtn: { position: "absolute", right: 14, zIndex: 1 },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
    backgroundColor: "#16161A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#26262C",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#44444C",
    backgroundColor: "#1C1C22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: "#E8001C",
    borderColor: "#E8001C",
  },
  termsText: {
    color: "#CCCCCC",
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  termsLink: {
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  registerBtn: {
    marginTop: 32,
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  registerBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  timerText: { color: "#888888", fontSize: 13 },
  loginRow: { alignItems: "center", marginTop: 32, marginBottom: 24 },
  loginText: { color: "#888888", fontSize: 14 },
  errorText: {
    color: "#E8001C",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
});
