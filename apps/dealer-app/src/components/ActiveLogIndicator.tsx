import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Typography } from "./ui/Typography";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { useRouter } from "expo-router";
import { useActiveDailyLog } from "../hooks/useDashboard";

export function ActiveLogIndicator() {
  const router = useRouter();
  const { data: activeLog } = useActiveDailyLog();

  return (
    <View style={styles.container}>
      {activeLog ? (
        <View style={styles.activeRow}>
          <View style={styles.greenDot} />
          <Typography variant="caption" weight="700" color={COLORS.success}>
            ACTIVE LOG: {activeLog.name.toUpperCase()}
          </Typography>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.warningRow}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.8}
        >
          <View style={styles.yellowDot} />
          <Typography variant="caption" weight="700" color="#FFB300" style={{ flex: 1 }}>
            NO ACTIVE LOG (TAP TO OPEN LOG BEFORE RECORDING)
          </Typography>
          <Typography variant="caption" weight="800" color={COLORS.primaryLight} style={{ textDecorationLine: "underline" }}>
            OPEN LOG
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 200, 83, 0.08)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(0, 200, 83, 0.2)",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 179, 0, 0.08)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(255, 179, 0, 0.2)",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  yellowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFB300",
  },
});
