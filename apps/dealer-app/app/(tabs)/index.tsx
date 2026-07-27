import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../src/lib/apiClient";

import { useDealTabStore } from "../../src/stores/dealTabStore";
import { useAuthStore } from "../../src/stores/authStore";
import {
  useTodayActivity,
  useRefetchDashboardOnFocus,
  useActiveDailyLog,
} from "../../src/hooks/useDashboard";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Typography } from "../../src/components/ui/Typography";
import { Surface } from "../../src/components/ui/Surface";
import { Button } from "../../src/components/ui/Button";
import { useNotificationStore } from "../../src/stores/useNotificationStore";

export default function HomeScreen() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => n.status !== 'read').length;
  const user = useAuthStore((s) => s.user);
  const initials = (user?.displayName ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const tabs = useDealTabStore((s) => s.tabs);
  const removeTab = useDealTabStore((s) => s.removeTab);

  const { data: activeLog } = useActiveDailyLog();
  const { data: todayActivity } = useTodayActivity();
  useRefetchDashboardOnFocus();
  
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const [showOpenLogModal, setShowOpenLogModal] = useState(false);
  const [logName, setLogName] = useState("");
  const [startingCash, setStartingCash] = useState("");
  const [isCreatingLog, setIsCreatingLog] = useState(false);
  const [showCloseLogModal, setShowCloseLogModal] = useState(false);
  const [isClosingLog, setIsClosingLog] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; type: 'error' | 'success' } | null>(null);

  const handleCreateLog = async () => {
    if (!logName) {
      setAlertInfo({ title: "Error", message: "Please provide a name for the log", type: "error" });
      return;
    }
    setIsCreatingLog(true);
    try {
      await apiClient.post("/v1/daily-logs/", {
        name: logName,
        startingCash: startingCash ? parseFloat(startingCash) : 0
      });
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "active", user?.id] });
      setShowOpenLogModal(false);
      setLogName("");
      setStartingCash("");
    } catch (e: any) {
      setAlertInfo({ title: "Error", message: e?.message || "Failed to open log", type: "error" });
    } finally {
      setIsCreatingLog(false);
    }
  };

  const handleCloseLog = async () => {
    if (!activeLog) return;
    setIsClosingLog(true);
    try {
      await apiClient.patch(`/v1/daily-logs/${activeLog.id}/close`);
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "active", user?.id] });
      setShowCloseLogModal(false);
      setAlertInfo({ title: "Success", message: "Daily log closed successfully", type: "success" });
    } catch (e: any) {
      setAlertInfo({ title: "Error", message: e?.message || "Failed to close log", type: "error" });
    } finally {
      setIsClosingLog(false);
    }
  };

  const handleBuy = () => router.push("/buy/scan");
  const handleSell = () => router.push("/sell/scan");
  const handleExpense = () => router.push("/expense");
  const handleTrade = () => router.push("/trade");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── HEADER ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <Image
              source={require("../../assets/rslicon.jpeg")}
              style={{ width: 44, height: 44, borderRadius: RADIUS.sm }}
              resizeMode="contain"
            />
            <Typography variant="label" color={COLORS.zinc400} style={{ fontStyle: 'italic' }}>PRO</Typography>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
            <TouchableOpacity onPress={() => setShowNotifications(true)} style={{ position: "relative" }}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.zinc100} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    backgroundColor: COLORS.destructive,
                    borderRadius: RADIUS.full,
                    width: 16,
                    height: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" weight="800" color={COLORS.white} style={{ fontSize: 9 }}>
                    {unreadCount}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/more")}
              style={{
                width: 36,
                height: 36,
                borderRadius: RADIUS.full,
                backgroundColor: COLORS.zinc800,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              {user?.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <Typography variant="body" weight="700" color={COLORS.zinc100}>
                  {initials}
                </Typography>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ACTIVE DAILY LOG ── */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}>
          <Surface variant="glass" padding="md">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: activeLog ? COLORS.success : COLORS.zinc500 }} />
                <Typography variant="label" color={COLORS.zinc100}>
                  {activeLog ? activeLog.name : "No Active Log"}
                </Typography>
              </View>
              {!activeLog ? (
                <TouchableOpacity onPress={() => setShowOpenLogModal(true)}>
                  <Typography variant="label" color={COLORS.primaryLight}>Open Log</Typography>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setShowCloseLogModal(true)}>
                  <Typography variant="label" color={COLORS.destructive}>Close</Typography>
                </TouchableOpacity>
              )}
            </View>
            
            {activeLog && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.xs }}>
                <View>
                  <Typography variant="caption" color={COLORS.zinc400}>Money In</Typography>
                  <Typography variant="body" weight="700" color={COLORS.success}>${activeLog.stats?.moneyIn || "0"}</Typography>
                </View>
                <View>
                  <Typography variant="caption" color={COLORS.zinc400}>Money Out</Typography>
                  <Typography variant="body" weight="700" color={COLORS.destructive}>${activeLog.stats?.moneyOut || "0"}</Typography>
                </View>
                <View>
                  <Typography variant="caption" color={COLORS.zinc400}>Profit</Typography>
                  <Typography variant="body" weight="700" color={COLORS.zinc50}>${activeLog.stats?.profit || "0"}</Typography>
                </View>
              </View>
            )}
          </Surface>
        </View>

        {/* ── WORKFLOW BUTTONS (HERO) ── */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.md }}>
          <View style={{ flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.md }}>
            <Button
              label="Buy"
              variant="primary"
              size="hero"
              onPress={handleBuy}
              style={{ flex: 1 }}
            />
            <Button
              label="Sell"
              variant="destructive"
              size="hero"
              onPress={handleSell}
              style={{ flex: 1 }}
            />
          </View>
          <Button
            label="Add Expense"
            variant="outline"
            onPress={handleExpense}
            style={{ width: "100%" }}
          />
        </View>

        {/* ── ACTIVE DEAL TABS ── */}
        {tabs.length > 0 && (
          <View style={{ marginTop: SPACING.xl }}>
            <Typography variant="label" color={COLORS.zinc500} style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm }}>
              ACTIVE DEALS
            </Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: SPACING.md }}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => {
                    useDealTabStore.getState().setActiveTab(tab.id);
                    router.push(tab.type === "buy" ? "/buy/comps" : "/sell/price");
                  }}
                >
                  <Surface variant="glass" padding="md" style={{ width: 180 }}>
                    <Typography variant="body" weight="600" numberOfLines={1} style={{ marginBottom: SPACING.xs }}>
                      {tab.cardData?.player_name || "Unknown Card"}
                    </Typography>
                    <Typography variant="caption" color={COLORS.zinc400}>
                      Step {tab.step}/5 · {tab.type.toUpperCase()}
                    </Typography>
                    <TouchableOpacity style={{ position: "absolute", top: SPACING.sm, right: SPACING.sm, padding: 4 }} onPress={() => removeTab(tab.id)}>
                      <Ionicons name="close" size={16} color={COLORS.zinc400} />
                    </TouchableOpacity>
                  </Surface>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── TODAY'S ACTIVITY ── */}
        {todayActivity && todayActivity.length > 0 && (
          <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
            <Typography variant="label" color={COLORS.zinc500} style={{ marginBottom: SPACING.sm }}>
              TODAY'S ACTIVITY
            </Typography>
            <Surface padding="none" variant="elevated">
              {todayActivity.map((tx, i) => (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: SPACING.md,
                    borderBottomWidth: i < todayActivity.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.sm,
                      backgroundColor:
                        tx.type === "buy"
                          ? 'rgba(79,70,229,0.15)'
                          : tx.type === "expense"
                          ? 'rgba(245,158,11,0.15)'
                          : tx.type === "trade"
                          ? 'rgba(0,200,83,0.15)'
                          : 'rgba(225,29,72,0.15)',
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: SPACING.md,
                    }}
                  >
                    <Typography
                      variant="body"
                      weight="800"
                      color={
                        tx.type === "buy"
                          ? COLORS.primaryLight
                          : tx.type === "expense"
                          ? COLORS.warning
                          : tx.type === "trade"
                          ? "#00C853"
                          : COLORS.destructive
                      }
                    >
                      {tx.type === "buy" ? "B" : tx.type === "sell" ? "S" : tx.type === "expense" ? "E" : "TR"}
                    </Typography>
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Typography variant="body" weight="600" numberOfLines={1}>
                      {tx.playerName || (tx.type === "trade" ? "Trade Transaction" : "Activity")}
                    </Typography>
                    <Typography variant="caption" color={COLORS.zinc500} style={{ marginTop: 2 }}>
                      {tx.time} {tx.type === "trade" ? "· Trade" : ""}
                    </Typography>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Typography variant="body" weight="700" color={tx.type === "trade" ? "#00C853" : COLORS.text}>
                      {tx.type === "trade"
                        ? tx.price.startsWith("+") || tx.price.startsWith("-") || tx.price === "Straight Trade"
                          ? tx.price
                          : `$${tx.price}`
                        : `$${tx.price}`}
                    </Typography>
                    {tx.profit && (
                      <Typography variant="caption" weight="600" color={parseFloat(tx.profit) >= 0 ? COLORS.success : COLORS.destructive} style={{ marginTop: 2 }}>
                        {parseFloat(tx.profit) >= 0 ? "+" : ""}${tx.profit}
                      </Typography>
                    )}
                  </View>
                </View>
              ))}
            </Surface>
          </View>
        )}
      </ScrollView>

      <Modal visible={showNotifications} transparent={true} animationType="fade" onRequestClose={() => setShowNotifications(false)}>
        <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: "absolute",
                  top: 70,
                  right: SPACING.lg,
                  width: 320,
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...SHADOWS.lg,
                }}
              >
                <Typography variant="h3" weight="800" style={{ marginBottom: SPACING.md }}>
                  Notifications
                </Typography>
                {notifications.length === 0 ? (
                  <Typography variant="body" color={COLORS.zinc400} style={{ paddingVertical: SPACING.sm }}>
                    No new notifications
                  </Typography>
                ) : (
                  notifications.slice(0, 5).map((n, idx) => (
                    <TouchableOpacity
                      key={n.id}
                      style={{
                        flexDirection: "row",
                        gap: SPACING.sm,
                        paddingVertical: SPACING.md,
                        borderTopWidth: idx > 0 ? 1 : 0,
                        borderTopColor: COLORS.border,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.full,
                          backgroundColor: n.type === "sale" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name={n.type === "sale" ? "cash-outline" : "warning-outline"} size={20} color={n.type === "sale" ? COLORS.success : COLORS.warning} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="body" weight="700" style={{ marginBottom: SPACING.xs }} numberOfLines={1}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color={COLORS.zinc400} numberOfLines={2}>
                          {n.body || n.message}
                        </Typography>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
                <TouchableOpacity
                  style={{
                    marginTop: SPACING.md,
                    paddingTop: SPACING.md,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setShowNotifications(false);
                    router.push("/notifications");
                  }}
                >
                  <Typography variant="label" color={COLORS.primary}>
                    View All
                  </Typography>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── OPEN LOG MODAL ── */}
      <Modal visible={showOpenLogModal} transparent={true} animationType="fade" onRequestClose={() => setShowOpenLogModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowOpenLogModal(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '85%',
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.xl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...SHADOWS.lg,
                }}
              >
                <Typography variant="h3" weight="800" style={{ marginBottom: SPACING.md }}>
                  Start a Daily Log
                </Typography>

                <Typography variant="label" color={COLORS.zinc400} style={{ marginBottom: SPACING.xs }}>
                  LOG NAME *
                </Typography>
                <TextInput
                  placeholder="e.g., Dallas Card Show - Day 1"
                  placeholderTextColor={COLORS.zinc600}
                  style={{
                    backgroundColor: COLORS.background,
                    color: COLORS.white,
                    padding: SPACING.md,
                    borderRadius: RADIUS.sm,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    marginBottom: SPACING.lg,
                  }}
                  value={logName}
                  onChangeText={setLogName}
                />

                <Typography variant="label" color={COLORS.zinc400} style={{ marginBottom: SPACING.xs }}>
                  STARTING CASH
                </Typography>
                <TextInput
                  placeholder="e.g., 500"
                  placeholderTextColor={COLORS.zinc600}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: COLORS.background,
                    color: COLORS.white,
                    padding: SPACING.md,
                    borderRadius: RADIUS.sm,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    marginBottom: SPACING.xl,
                  }}
                  value={startingCash}
                  onChangeText={setStartingCash}
                />

                <View style={{ flexDirection: "row", gap: SPACING.md }}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    onPress={() => setShowOpenLogModal(false)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label={isCreatingLog ? "Starting..." : "Start Log"}
                    variant="primary"
                    onPress={handleCreateLog}
                    disabled={isCreatingLog}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── CLOSE LOG MODAL ── */}
      <Modal visible={showCloseLogModal} transparent={true} animationType="fade" onRequestClose={() => setShowCloseLogModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCloseLogModal(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '85%',
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.xl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...SHADOWS.lg,
                }}
              >
                <Typography variant="h3" weight="800" style={{ marginBottom: SPACING.md }}>
                  Close Daily Log
                </Typography>

                <Typography variant="body" color={COLORS.zinc400} style={{ marginBottom: SPACING.xl, lineHeight: 22 }}>
                  Are you sure you want to close your daily log "{activeLog?.name}"? This will finalize your stats for today.
                </Typography>

                <View style={{ flexDirection: "row", gap: SPACING.md }}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    onPress={() => setShowCloseLogModal(false)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label={isClosingLog ? "Closing..." : "Close Log"}
                    variant="destructive"
                    onPress={handleCloseLog}
                    disabled={isClosingLog}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── CUSTOM ALERT MODAL ── */}
      <Modal visible={!!alertInfo} transparent={true} animationType="fade" onRequestClose={() => setAlertInfo(null)}>
        <TouchableWithoutFeedback onPress={() => setAlertInfo(null)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '85%',
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.xl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...SHADOWS.lg,
                  alignItems: "center"
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: alertInfo?.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(225,29,72,0.15)',
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: SPACING.md
                  }}
                >
                  <Ionicons 
                    name={alertInfo?.type === 'success' ? "checkmark-circle" : "alert-circle"} 
                    size={28} 
                    color={alertInfo?.type === 'success' ? COLORS.success : COLORS.destructive} 
                  />
                </View>
                
                <Typography variant="h3" weight="800" style={{ marginBottom: SPACING.sm, textAlign: "center" }}>
                  {alertInfo?.title}
                </Typography>

                <Typography variant="body" color={COLORS.zinc400} style={{ marginBottom: SPACING.xl, textAlign: "center", lineHeight: 22 }}>
                  {alertInfo?.message}
                </Typography>

                <Button
                  label="Okay"
                  variant="outline"
                  onPress={() => setAlertInfo(null)}
                  style={{ width: '100%' }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}
