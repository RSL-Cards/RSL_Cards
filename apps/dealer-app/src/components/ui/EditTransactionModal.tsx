import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { useAuthStore } from "../../stores/authStore";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../constants/theme";
import { Typography } from "./Typography";
import { Button } from "./Button";

export interface TransactionToEdit {
  id: string;
  type: "buy" | "sell" | "trade" | "expense";
  playerName?: string;
  description?: string;
  price?: string | number;
  amount?: string | number;
  paymentMethod?: string;
  channel?: string;
}

interface EditTransactionModalProps {
  visible: boolean;
  transaction: TransactionToEdit | null;
  onClose: () => void;
  onSuccess?: () => void;
}

import { PAYMENT_METHODS, TRANSACTION_CHANNELS } from "../../constants/transactionOptions";

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  visible,
  transaction,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [channel, setChannel] = useState("card_show");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.playerName || transaction.description || "");
      const rawAmt = transaction.amount ?? transaction.price ?? "0";
      setAmount(String(Math.abs(parseFloat(String(rawAmt)) || 0)));
      setPaymentMethod(transaction.paymentMethod || "cash");
      setChannel(transaction.channel || "card_show");
    }
  }, [transaction]);

  if (!transaction) return null;

  const isExpense = transaction.type === "expense";

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert("Validation Error", "Please enter a valid amount.");
      return;
    }

    setIsSaving(true);
    try {
      if (isExpense) {
        await apiClient.patch(`/v1/analytics/expenses/${transaction.id}`, {
          category: title || "General",
          amount: parseFloat(amount),
          description: title || undefined,
        });
      } else {
        await apiClient.patch(`/v1/transactions/${transaction.id}`, {
          playerName: title,
          price: parseFloat(amount),
          amount: parseFloat(amount),
          paymentMethod,
          channel,
        });
      }

      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ["analytics", "today-activity", userId] });
        await queryClient.invalidateQueries({ queryKey: ["analytics", "daily", userId] });
        await queryClient.invalidateQueries({ queryKey: ["daily-logs", "active", userId] });
        await queryClient.invalidateQueries({ queryKey: ["daily-logs", "list", userId] });
        await queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update transaction.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.headerRow}>
                <Typography variant="h3" weight="800" color={COLORS.white}>
                  Edit {transaction.type.toUpperCase()} Entry
                </Typography>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={COLORS.zinc400} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {/* Title / Description */}
                <Typography variant="label" color={COLORS.zinc400} style={styles.fieldLabel}>
                  {isExpense ? "CATEGORY / NOTE" : "PLAYER / CARD NAME"}
                </Typography>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Luka Doncic PSA 10"
                  placeholderTextColor={COLORS.zinc600}
                />

                {/* Amount */}
                <Typography variant="label" color={COLORS.zinc400} style={styles.fieldLabel}>
                  AMOUNT ($)
                </Typography>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.zinc600}
                />

                {!isExpense && (
                  <>
                    {/* Payment Method */}
                    <Typography variant="label" color={COLORS.zinc400} style={styles.fieldLabel}>
                      PAYMENT METHOD
                    </Typography>
                    <View style={styles.chipRow}>
                      {PAYMENT_METHODS.map((pm) => (
                        <TouchableOpacity
                          key={pm.key}
                          onPress={() => setPaymentMethod(pm.key)}
                          style={[
                            styles.chip,
                            paymentMethod === pm.key && styles.chipActive,
                          ]}
                        >
                          <Typography
                            variant="caption"
                            weight="700"
                            color={paymentMethod === pm.key ? COLORS.white : COLORS.zinc400}
                          >
                            {pm.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Sales Channel */}
                    <Typography variant="label" color={COLORS.zinc400} style={styles.fieldLabel}>
                      WHERE / CHANNEL
                    </Typography>
                    <View style={styles.chipRow}>
                      {TRANSACTION_CHANNELS.map((ch) => (
                        <TouchableOpacity
                          key={ch.key}
                          onPress={() => setChannel(ch.key)}
                          style={[
                            styles.chip,
                            channel === ch.key && styles.chipActive,
                          ]}
                        >
                          <Typography
                            variant="caption"
                            weight="700"
                            color={channel === ch.key ? COLORS.white : COLORS.zinc400}
                          >
                            {ch.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.actionsRow}>
                <Button
                  label="Cancel"
                  variant="outline"
                  onPress={onClose}
                  style={{ flex: 1 }}
                />
                <Button
                  label={isSaving ? "Saving..." : "Save Changes"}
                  variant="primary"
                  onPress={handleSave}
                  disabled={isSaving}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "88%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  closeBtn: {
    padding: 4,
  },
  fieldLabel: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
});
