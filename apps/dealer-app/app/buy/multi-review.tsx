import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { batchService } from "../../src/services/cardService";
import { Typography } from "../../src/components/ui/Typography";
import { Button } from "../../src/components/ui/Button";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useDealTabStore } from "../../src/stores/dealTabStore";
import RSLLoader from "../../src/components/RSLLoader";

export default function MultiReviewScreen() {
  const router = useRouter();
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const addTab = useDealTabStore((s) => s.addTab);

  const { data: job, isLoading } = useQuery({
    queryKey: ["batch_jobs", batchId],
    queryFn: () => batchService.getJob(batchId as string),
    enabled: !!batchId,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (job?.resultsJson) {
      // By default, select all cards
      const allIds = new Set(job.resultsJson.map((c: any) => c.id));
      setSelectedIds(allIds);
    }
  }, [job]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <RSLLoader size={36} />
      </View>
    );
  }

  if (!job || !job.resultsJson) {
    return (
      <View style={styles.center}>
        <Typography variant="body" color={COLORS.zinc400}>Failed to load batch data.</Typography>
      </View>
    );
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleNext = () => {
    router.push({
      pathname: "/buy/multi-price",
      params: { batchId, selectedIds: Array.from(selectedIds).join(",") }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Typography variant="h3" weight="700" color={COLORS.white}>Review Cards</Typography>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <Typography variant="body" color={COLORS.zinc400} style={{ marginBottom: SPACING.lg }}>
          Select the cards you want to add to your inventory.
        </Typography>

        {job.resultsJson.map((card: any) => {
          const isSelected = selectedIds.has(card.id);
          const activeLowest = card.comps?.snapshots?.[0]?.lowestActive || "0.00";
          const avgSold = card.comps?.snapshots?.[0]?.avgSoldPrice || "0.00";

          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.cardRow, isSelected && styles.cardRowSelected]}
              onPress={() => toggleSelect(card.id)}
            >
              <View style={[styles.checkbox, isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="body" weight="700" color={COLORS.white}>
                  {card.year} {card.set_name} {card.player_name}
                </Typography>
                <Typography variant="caption" color={COLORS.zinc400}>
                  {card.variation || "Base"} {card.gradeKey !== "RAW" ? `• ${String(card.gradeKey).replace(/_/g, " ")}` : ""}
                </Typography>
                
                <View style={{ flexDirection: "row", gap: SPACING.lg, marginTop: SPACING.sm }}>
                  <View>
                    <Typography variant="caption" color={COLORS.zinc500}>Avg Sold</Typography>
                    <Typography variant="body" weight="700" color={COLORS.success}>${avgSold}</Typography>
                  </View>
                  <View>
                    <Typography variant="caption" color={COLORS.zinc500}>Lowest Active</Typography>
                    <Typography variant="body" weight="700" color={COLORS.zinc100}>${activeLowest}</Typography>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label={`Set Prices for ${selectedIds.size} Cards`} 
          variant="primary" 
          onPress={handleNext}
          disabled={selectedIds.size === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: SPACING.md },
  iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.zinc800,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(0, 87, 255, 0.1)",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.zinc500,
    marginRight: SPACING.md,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  }
});
