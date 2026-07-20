import { View, ScrollView, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { Surface } from "../../src/components/ui/Surface";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

import { useActiveDailyLog } from "../../src/hooks/useDashboard";
import { ActiveLogIndicator } from "../../src/components/ActiveLogIndicator";
import { apiClient } from "../../src/lib/apiClient";
import NetInfo from "@react-native-community/netinfo";
import { useSyncStore } from "../../src/stores/syncStore";
import Toast from "react-native-toast-message";

export default function TradeScreen() {
  const router = useRouter();
  const { data: activeLog } = useActiveDailyLog();
  
  // This is a simplified form for Phase 1
  const [cardsGiven, setCardsGiven] = useState("");
  const [cardsReceived, setCardsReceived] = useState("");
  const [cashDifference, setCashDifference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!cardsGiven || !cardsReceived) {
      Alert.alert("Error", "Please fill in all card details.");
      return;
    }
    
    if (!activeLog) {
      Alert.alert(
        "No Active Daily Log",
        "You are about to record this trade outside of an active daily log. Would you like to proceed or open a daily log first?",
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

    const price = parseFloat(cashDifference) || 0;
    const payload = {
      price,
      paymentMethod: "trade",
      channel: "card_show",
      dailyLogId: activeLog?.id || null,
      cardsGiven: [
        { playerName: cardsGiven, gradeKey: "RAW", marketValue: 0 }
      ],
      cardsReceived: [
        { 
          playerName: cardsReceived, 
          gradeKey: "RAW", 
          marketValue: 0, 
          year: new Date().getFullYear(), 
          setName: "Trade", 
          variation: "Base", 
          cardNumber: "N/A",
          sport: "other"
        }
      ]
    };

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        useSyncStore.getState().addPendingTransaction("trade", payload);
        Alert.alert("Saved Offline", "Pending Sync — trade transaction will sync when online.", [
          { text: "OK", onPress: () => router.back() }
        ]);
        return;
      }

      await apiClient.post("/v1/transactions/trade", payload);
      Alert.alert("Success", "Trade recorded successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to record trade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <Button label="Back" variant="outline" onPress={() => router.back()} size="sm" />
        <Typography variant="h2" weight="800">Trade</Typography>
        <View style={{ width: 60 }} />
      </View>

      <ActiveLogIndicator />

      <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
        <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
          CARDS GIVEN (LEAVING INVENTORY)
        </Typography>
        <Surface variant="elevated" padding="none">
          <TextInput
            style={styles.input}
            placeholder="e.g. 2021 Panini Prizm Trevor Lawrence Base"
            placeholderTextColor={COLORS.zinc500}
            value={cardsGiven}
            onChangeText={setCardsGiven}
          />
        </Surface>

        <Typography variant="label" color={COLORS.zinc500} style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          CARDS RECEIVED
        </Typography>
        <Surface variant="elevated" padding="none">
          <TextInput
            style={styles.input}
            placeholder="e.g. 2020 Bowman Chrome Jasson Dominguez Base"
            placeholderTextColor={COLORS.zinc500}
            value={cardsReceived}
            onChangeText={setCardsReceived}
          />
        </Surface>

        <Typography variant="label" color={COLORS.zinc500} style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          CASH DIFFERENCE
        </Typography>
        <Surface variant="elevated" padding="none">
          <TextInput
            style={styles.input}
            placeholder="e.g. 50 (Cash Paid) or -50 (Cash Received)"
            placeholderTextColor={COLORS.zinc500}
            keyboardType="numbers-and-punctuation"
            value={cashDifference}
            onChangeText={setCashDifference}
          />
        </Surface>

        <Button
          label={isSubmitting ? "Saving..." : "Record Trade"}
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
