import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from "react-native";
import { useNotificationStore, NotificationEvent } from "../stores/useNotificationStore";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const getIcon = (type: string, status?: string) => {
  if (status === "processing" || status === "progress") {
    return <Ionicons name="sync-circle" size={24} color="#3b82f6" />;
  }
  if (status === "completed" || type === "success") {
    return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
  }
  if (status === "failed" || type === "error") {
    return <Ionicons name="close-circle" size={24} color="#ef4444" />;
  }
  return <Ionicons name="information-circle" size={24} color="#3b82f6" />;
};

const NotificationItem = ({ notification }: { notification: NotificationEvent }) => {
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  useEffect(() => {
    if (notification.status !== "processing" && notification.status !== "progress") {
      const timer = setTimeout(() => {
        dismissToast(notification.id);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, dismissToast]);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.iconContainer}>
        {getIcon(notification.type, notification.status)}
      </View>
      <View style={styles.textContainer}>
        {notification.title ? (
          <Text style={styles.titleText}>{notification.title}</Text>
        ) : null}
        <Text style={styles.messageText}>{notification.message || notification.body}</Text>
        <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
          {(() => {
            const raw = notification.createdAt || notification.created_at;
            if (!raw) return "";
            const d = new Date(raw);
            if (isNaN(d.getTime())) return "";
            const day = d.getDate();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const month = monthNames[d.getMonth()];
            const year = d.getFullYear();
            let hours = d.getHours();
            const minutes = d.getMinutes().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            const formattedHours = hours.toString().padStart(2, "0");
            return `${day} ${month}, ${year} at ${formattedHours}:${minutes} ${ampm}`;
          })()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => dismissToast(notification.id)}
      >
        <Ionicons name="close" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export function NotificationToaster() {
  const notifications = useNotificationStore((state) => state.notifications);
  const visibleToasts = notifications.filter((n) => !n.dismissedToast);

  if (visibleToasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {visibleToasts.map((notif) => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toastContainer: {
    width: width - 32,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    color: "#4b5563",
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
