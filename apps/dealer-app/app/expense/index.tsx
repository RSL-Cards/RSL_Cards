import { View, ScrollView, TextInput, StyleSheet, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { Surface } from "../../src/components/ui/Surface";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

import { useActiveDailyLog } from "../../src/hooks/useDashboard";
import { apiClient } from "../../src/lib/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../src/stores/authStore";
import NetInfo from "@react-native-community/netinfo";
import { useSyncStore } from "../../src/stores/syncStore";
import Toast from "react-native-toast-message";

import { ActiveLogIndicator } from "../../src/components/ActiveLogIndicator";

export default function ExpenseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: activeLog } = useActiveDailyLog();
  
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category || !amount) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    
    if (!activeLog) {
      Alert.alert(
        "No Active Daily Log",
        "You are about to record this expense outside of an active daily log. Would you like to proceed or open a daily log first?",
        [
          { text: "Open Daily Log", onPress: () => router.push("/(tabs)/") },
          { text: "Proceed Anyway", onPress: () => processSubmit() }
        ]
      );
    } else {
      processSubmit();
    }
  };

  const processSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      category,
      amount: parseFloat(amount) || 0,
      description: note,
      dailyLogId: activeLog?.id || null,
    };

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        useSyncStore.getState().addPendingExpense(payload);
        Alert.alert("Saved Offline", "Pending Sync — expense transaction will sync when online.", [
          { text: "OK", onPress: () => router.back() }
        ]);
        return;
      }

      await apiClient.post("/v1/analytics/expenses", payload);
      queryClient.invalidateQueries({ queryKey: ["analytics", "today-activity", userId] });
      queryClient.invalidateQueries({ queryKey: ["daily-logs", "active", userId] });
      setIsSubmitting(false);
      Alert.alert("Success", "Expense recorded successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e: any) {
      setIsSubmitting(false);
      Alert.alert("Error", e?.message || "Failed to save expense");
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <Button label="Back" variant="outline" onPress={() => router.back()} size="sm" />
        <Typography variant="h2" weight="800">Expense</Typography>
        <View style={{ width: 60 }} />
      </View>

      <ActiveLogIndicator />

      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {activeLog && (
          <View style={{ marginBottom: SPACING.xl, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <Typography variant="label" color={COLORS.success} style={{ marginBottom: 4 }}>
              ATTACHING TO ACTIVE LOG
            </Typography>
            <Typography variant="body" weight="700" color={COLORS.white}>
              {activeLog.name}
            </Typography>
          </View>
        )}

        <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
          CATEGORY *
        </Typography>
        <Surface variant="elevated" padding="none">
          <TextInput
            style={styles.input}
            placeholder="e.g. Show Fee, Shipping, Supplies"
            placeholderTextColor={COLORS.zinc500}
            value={category}
            onChangeText={setCategory}
          />
        </Surface>

        <Typography variant="label" color={COLORS.zinc500} style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          AMOUNT *
        </Typography>
        <Surface variant="elevated" padding="none">
          <TextInput
            style={styles.input}
            placeholder="e.g. 150"
            placeholderTextColor={COLORS.zinc500}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </Surface>

        <Typography variant="label" color={COLORS.zinc500} style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          NOTE
        </Typography>
        <Surface variant="elevated" padding="none">
          <TextInput
            style={styles.input}
            placeholder="Optional details..."
            placeholderTextColor={COLORS.zinc500}
            value={note}
            onChangeText={setNote}
          />
        </Surface>

        <Button
          label={isSubmitting ? "Saving..." : "Record Expense"}
          onPress={handleSubmit}
          variant="primary"
          style={{ marginTop: SPACING.xxl }}
          disabled={isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  input: {
    color: COLORS.white,
    padding: SPACING.md,
    fontSize: 16,
  }
});
