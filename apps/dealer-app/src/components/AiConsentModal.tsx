import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { acceptAiConsent } from "../lib/aiConsent";

type Props = {
  visible: boolean;
  onAccepted: () => void;
  onDeclined: () => void;
  title?: string;
};

/**
 * First-run consent before sending card photos / prompts to Google Gemini.
 */
export function AiConsentModal({
  visible,
  onAccepted,
  onDeclined,
  title = "AI Card Features",
}: Props) {
  const handleAccept = async () => {
    await acceptAiConsent();
    onAccepted();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDeclined}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons name="sparkles" size={22} color="#34d399" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Third-party AI notice</Text>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.paragraph}>
              Card scanning and the dealer assistant send images or text you provide to{" "}
              <Text style={styles.bold}>Google Gemini</Text> for identification and answers.
            </Text>
            <Text style={styles.paragraph}>
              Data is encrypted in transit. Under Google’s AI terms for this product path, your
              dealer queries are not used to train public models. You can avoid AI features by
              declining and using manual search instead.
            </Text>
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("https://rslcards.com/privacy-policy")}
            >
              Read our Privacy Policy
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.declineBtn} onPress={onDeclined} activeOpacity={0.85}>
              <Text style={styles.declineText}>Not now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
              <Text style={styles.acceptText}>I Understand & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#111111",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: { alignItems: "center", paddingTop: 22, paddingHorizontal: 20 },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#052e1c",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
  subtitle: { color: "#888", fontSize: 13, marginTop: 4, marginBottom: 8 },
  body: { paddingHorizontal: 20, marginTop: 8, maxHeight: 260 },
  paragraph: { color: "#cfcfcf", fontSize: 14, lineHeight: 21, marginBottom: 12 },
  bold: { color: "#fff", fontWeight: "700" },
  link: { color: "#0057FF", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  actions: { flexDirection: "row", gap: 10, padding: 16 },
  declineBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  declineText: { color: "#aaa", fontWeight: "700" },
  acceptBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0057FF",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
