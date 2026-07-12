import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";
import * as Device from "expo-device";
import { Platform, LogBox } from "react-native";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
]);

let Notifications: any = null;
try {
  Notifications = require("expo-notifications");
} catch (err) {
  console.warn("expo-notifications is not supported in this client (Expo Go Android). Background notifications disabled.");
}

export const notificationService = {
  async registerToken(token: string, platform: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post<{ success: boolean }>(
      ENDPOINTS.notifications.registerToken,
      { token, platform }
    );
    return data;
  },

  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!Notifications) {
      console.warn("Push notifications are disabled in this environment");
      return;
    }

    if (!Device.isDevice) {
      console.warn("Must use physical device for Push Notifications");
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const settings = await Notifications.getPermissionsAsync() as any;
    let isGranted = settings.granted;

    if (!isGranted) {
      const requestResult = await Notifications.requestPermissionsAsync() as any;
      isGranted = requestResult.granted;
    }

    if (!isGranted) {
      console.warn("Failed to get push token for push notification!");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Register token with backend
    try {
      const platform = Platform.OS; // 'ios' | 'android'
      await this.registerToken(token, platform);
      console.log("Registered token successfully with backend:", token);
    } catch (err: any) {
      console.error("Failed to register token with backend:", err.message);
    }

    return token;
  }
};
