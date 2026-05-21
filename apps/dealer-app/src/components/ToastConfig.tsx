import { View, Text, StyleSheet } from "react-native";
import { ToastConfig } from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.container, { borderLeftColor: "#00C853" }]}>
      <View style={[styles.iconWrap, { backgroundColor: "rgba(0,200,83,0.15)" }]}>
        <Ionicons name="checkmark-circle" size={20} color="#00C853" />
      </View>
      <View style={styles.textWrap}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.container, { borderLeftColor: "#E8001C" }]}>
      <View style={[styles.iconWrap, { backgroundColor: "rgba(232,0,28,0.15)" }]}>
        <Ionicons name="close-circle" size={20} color="#E8001C" />
      </View>
      <View style={styles.textWrap}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[styles.container, { borderLeftColor: "#0057FF" }]}>
      <View style={[styles.iconWrap, { backgroundColor: "rgba(0,87,255,0.15)" }]}>
        <Ionicons name="information-circle" size={20} color="#0057FF" />
      </View>
      <View style={styles.textWrap}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 18,
  },
});
