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
} from "react-native";
import { useRouter } from "expo-router";
import { useLogin, useSendLoginOtp, useLoginWithOtp, useGoogleAuth } from "../../src/hooks/useAuth";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("otp");
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(300);

  const { mutate: loginWithPassword, isPending: isPendingPassword, error: passwordError } = useLogin();
  const { mutate: sendLoginOtp, isPending: isPendingSendOtp, error: sendOtpError } = useSendLoginOtp();
  const { mutate: loginWithOtp, isPending: isPendingOtpLogin, error: otpLoginError } = useLoginWithOtp();
  const { promptGoogleSignIn } = useGoogleAuth();

  useEffect(() => {
    let interval: any = null;
    if (authMethod === "otp" && otpStep === "code" && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authMethod, otpStep, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const apiError =
    (passwordError as any)?.response?.data?.message ||
    (sendOtpError as any)?.response?.data?.message ||
    (otpLoginError as any)?.response?.data?.message ||
    null;
  const displayError = validationError || apiError;

  const handlePasswordSignIn = () => {
    if (!email || !password) {
      setValidationError("Please enter your email and password.");
      return;
    }
    setValidationError("");
    loginWithPassword({ email: email.trim().toLowerCase(), password });
  };

  const handleSendLoginOtp = () => {
    if (!email) {
      setValidationError("Please enter your email address.");
      return;
    }
    setValidationError("");
    sendLoginOtp(
      { email: email.trim().toLowerCase() },
      {
        onSuccess: () => {
          setOtpStep("code");
          setTimerSeconds(300);
        },
      }
    );
  };

  const handleVerifyOtpSignIn = () => {
    if (!otp || otp.length !== 6) {
      setValidationError("Please enter the 6-digit OTP code.");
      return;
    }
    setValidationError("");
    loginWithOtp({ email: email.trim().toLowerCase(), otp: otp.trim() });
  };

  const handleResendOtp = () => {
    setValidationError("");
    sendLoginOtp(
      { email: email.trim().toLowerCase() },
      {
        onSuccess: () => {
          setTimerSeconds(300);
        },
      }
    );
  };

  const isBusy = isPendingPassword || isPendingSendOtp || isPendingOtpLogin;

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
            onPress={() => {
              if (authMethod === "otp" && otpStep === "code") {
                setOtpStep("email");
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Welcome back, dealer</Text>

            {/* Auth Method Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, authMethod === "password" && styles.tabBtnActive]}
                onPress={() => {
                  setAuthMethod("password");
                  setValidationError("");
                }}
              >
                <Text style={[styles.tabText, authMethod === "password" && styles.tabTextActive]}>
                  Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, authMethod === "otp" && styles.tabBtnActive]}
                onPress={() => {
                  setAuthMethod("otp");
                  setValidationError("");
                }}
              >
                <Text style={[styles.tabText, authMethod === "otp" && styles.tabTextActive]}>
                  Email OTP Code
                </Text>
              </TouchableOpacity>
            </View>

            {authMethod === "password" ? (
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

                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {displayError ? (
                  <Text style={styles.errorText}>{displayError}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={handlePasswordSignIn}
                  disabled={isBusy}
                  activeOpacity={0.85}
                >
                  {isBusy ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.signInBtnText}>Sign In with Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={() => promptGoogleSignIn()}
                  activeOpacity={0.85}
                >
                  <AntDesign name="google" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
                  <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                    Sign In with Google
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
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
                  editable={otpStep === "email"}
                />

                {otpStep === "code" && (
                  <>
                    <View style={{ height: 20 }} />
                    <Text style={styles.label}>ENTER 6-DIGIT LOGIN CODE</Text>
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
                        disabled={isPendingSendOtp || timerSeconds > 240}
                      >
                        <Text style={{ color: timerSeconds > 240 ? "#555" : "#0057FF", fontWeight: "600" }}>
                          Resend Code
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {displayError ? (
                  <Text style={styles.errorText}>{displayError}</Text>
                ) : null}

                {otpStep === "email" ? (
                  <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={handleSendLoginOtp}
                    disabled={isPendingSendOtp}
                    activeOpacity={0.85}
                  >
                    {isPendingSendOtp ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.signInBtnText}>Send Login Code</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={handleVerifyOtpSignIn}
                    disabled={isPendingOtpLogin}
                    activeOpacity={0.85}
                  >
                    {isPendingOtpLogin ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.signInBtnText}>Verify & Sign In</Text>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={() => promptGoogleSignIn()}
                  activeOpacity={0.85}
                >
                  <AntDesign name="google" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
                  <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                    Sign In with Google
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 4,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#2A2A2A",
  },
  tabText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  form: { marginTop: 24 },
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
    marginTop: 24,
    backgroundColor: "#E8001C",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signInBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  googleBtn: {
    marginTop: 12,
    backgroundColor: "#1A1A1A",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  timerText: { color: "#888888", fontSize: 13 },
  createRow: { alignItems: "center", marginTop: 32, marginBottom: 24 },
  createText: { color: "#888888", fontSize: 14 },
});
