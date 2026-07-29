import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { batchService, inventoryService, type AddInventoryItem } from "../../src/services/cardService";
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function MultiConfirmScreen() {
  const router = useRouter();
  const { batchId, selectedIds, pricingData } = useLocalSearchParams<{ batchId: string; selectedIds: string; pricingData: string }>();
  const idArray = (selectedIds || "").split(",").filter(Boolean);
  const pricing = pricingData ? JSON.parse(pricingData) : {};

  const { data: job } = useQuery({
    queryKey: ["batch_jobs", batchId],
    queryFn: () => batchService.getJob(batchId as string),
    enabled: !!batchId,
  });

  const cards = (job?.resultsJson || []).filter((c: any) => idArray.includes(c.id));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPaid = cards.reduce((acc: number, card: any) => {
    return acc + parseFloat(pricing[card.id]?.paidPrice || "0");
  }, 0);

  const totalAsk = cards.reduce((acc: number, card: any) => {
    return acc + parseFloat(pricing[card.id]?.askPrice || "0");
  }, 0);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // For each card, call addInventory endpoint
      for (const card of cards) {
        const p = pricing[card.id];
        
        // Mock payload structure based on AddInventoryItem
        const payload: AddInventoryItem = {
          playerName: card.player_name,
          year: card.year,
          setName: card.set_name,
          variation: card.variation,
          cardNumber: card.card_number,
          sport: card.sport,
          gradeCompany: card.grading?.company,
          gradeValue: card.grading?.grade,
          certNumber: card.grading?.cert_number,
          costBasis: parseFloat(p?.paidPrice || "0"),
          currentMarketValue: parseFloat(p?.askPrice || "0"),
        };
        
        // Await the actual network call to save the item
        await inventoryService.addItem(payload);
        console.log("Successfully added card to inventory:", payload);
      }
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Added ${cards.length} cards to your inventory!`
      });
      router.push("/(tabs)/");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Failed to add some cards"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Typography variant="h3" weight="700" color={COLORS.white}>Confirm Batch</Typography>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <Typography variant="body" color={COLORS.zinc400} style={{ marginBottom: SPACING.lg }}>
          You are about to add {cards.length} cards to your inventory.
        </Typography>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Typography variant="body" color={COLORS.zinc400}>Total Cards</Typography>
            <Typography variant="body" weight="700" color={COLORS.white}>{cards.length}</Typography>
          </View>
          <View style={styles.summaryRow}>
            <Typography variant="body" color={COLORS.zinc400}>Total Paid</Typography>
            <Typography variant="body" weight="700" color={COLORS.white}>${totalPaid.toFixed(2)}</Typography>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
            <Typography variant="body" color={COLORS.zinc400}>Total Ask Price</Typography>
            <Typography variant="body" weight="700" color={COLORS.success}>${totalAsk.toFixed(2)}</Typography>
          </View>
        </View>

        <Typography variant="label" color={COLORS.zinc500} style={{ marginVertical: SPACING.md }}>CARD LIST</Typography>

        {cards.map((card: any) => {
          const p = pricing[card.id];
          return (
            <View key={card.id} style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Typography variant="body" weight="700" color={COLORS.white}>
                  {card.year} {card.set_name} {card.player_name}
                </Typography>
                <Typography variant="caption" color={COLORS.zinc400}>
                  {card.variation || "Base"} {card.gradeKey !== "RAW" ? `• ${String(card.gradeKey).replace(/_/g, " ")}` : ""}
                </Typography>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Typography variant="caption" color={COLORS.zinc400}>Paid: ${p?.paidPrice || "0"}</Typography>
                <Typography variant="body" weight="700" color={COLORS.success}>Ask: ${p?.askPrice || "0"}</Typography>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label={isSubmitting ? "Adding to Inventory..." : "Confirm & Add"} 
          variant="primary" 
          onPress={handleConfirm}
          disabled={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: SPACING.md },
  iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  summaryCard: {
    backgroundColor: COLORS.zinc800,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  }
});
