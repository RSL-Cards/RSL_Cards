import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { batchService } from "../../src/services/cardService";
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface CardPricing {
  condition: string;
  paidPrice: string;
  askPrice: string;
}

export default function MultiPriceScreen() {
  const router = useRouter();
  const { batchId, selectedIds } = useLocalSearchParams<{ batchId: string; selectedIds: string }>();
  const idArray = (selectedIds || "").split(",").filter(Boolean);

  const { data: job } = useQuery({
    queryKey: ["batch_jobs", batchId],
    queryFn: () => batchService.getJob(batchId as string),
    enabled: !!batchId,
  });

  const cards = (job?.resultsJson || []).filter((c: any) => idArray.includes(c.id));

  const [pricing, setPricing] = useState<Record<string, CardPricing>>({});

  const updatePricing = (id: string, field: keyof CardPricing, value: string) => {
    setPricing((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { condition: "Mint", paidPrice: "", askPrice: "" }),
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    // In a full implementation, we'd add these to the cart or save them in the store.
    // For now, let's navigate to multi-confirm and pass the pricing via store or params.
    // Since params can't easily hold complex objects, we stringify it.
    router.push({
      pathname: "/buy/multi-confirm",
      params: { 
        batchId, 
        selectedIds,
        pricingData: JSON.stringify(pricing)
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Typography variant="h3" weight="700" color={COLORS.white}>Set Prices</Typography>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <Typography variant="body" color={COLORS.zinc400} style={{ marginBottom: SPACING.lg }}>
          Enter condition and pricing for {cards.length} selected cards.
        </Typography>

        {cards.map((card: any) => {
          const cardPricing = pricing[card.id] || { condition: "Mint", paidPrice: "", askPrice: "" };
          
          return (
            <View key={card.id} style={styles.cardRow}>
              <View style={{ marginBottom: SPACING.sm }}>
                <Typography variant="body" weight="700" color={COLORS.white} style={{ marginBottom: 2 }}>
                  {card.year} {card.set_name} {card.player_name}
                </Typography>
                <Typography variant="caption" color={COLORS.zinc400} style={{ marginBottom: SPACING.md }}>
                  {card.variation || "Base"} {card.gradeKey !== "RAW" ? `• ${card.gradeKey}` : ""}
                </Typography>
                
                <View style={{ flexDirection: "row", gap: SPACING.lg, marginBottom: SPACING.md }}>
                  <View>
                    <Typography variant="caption" color={COLORS.zinc500}>Avg Sold</Typography>
                    <Typography variant="body" weight="700" color={COLORS.success}>${card.comps?.snapshots?.[0]?.avgSoldPrice || "0.00"}</Typography>
                  </View>
                  <View>
                    <Typography variant="caption" color={COLORS.zinc500}>Lowest Active</Typography>
                    <Typography variant="body" weight="700" color={COLORS.zinc100}>${card.comps?.snapshots?.[0]?.lowestActive || "0.00"}</Typography>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: SPACING.sm }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color={COLORS.zinc500} style={{ marginBottom: 4 }}>Condition</Typography>
                  <TextInput
                    style={styles.input}
                    value={cardPricing.condition}
                    onChangeText={(t) => updatePricing(card.id, "condition", t)}
                    placeholder="e.g. Mint"
                    placeholderTextColor={COLORS.zinc500}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color={COLORS.zinc500} style={{ marginBottom: 4 }}>Cost Basis (Bought For $)</Typography>
                  <TextInput
                    style={styles.input}
                    value={cardPricing.paidPrice}
                    onChangeText={(t) => updatePricing(card.id, "paidPrice", t)}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.zinc500}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color={COLORS.zinc500} style={{ marginBottom: 4 }}>Target Sale Price ($)</Typography>
                  <TextInput
                    style={styles.input}
                    value={cardPricing.askPrice}
                    onChangeText={(t) => updatePricing(card.id, "askPrice", t)}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.zinc500}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label={`Review & Confirm`} 
          variant="primary" 
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: SPACING.md },
  iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  cardRow: {
    backgroundColor: COLORS.zinc800,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    backgroundColor: COLORS.zinc900,
    color: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  }
});
