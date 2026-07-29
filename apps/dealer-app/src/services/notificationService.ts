import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";
import * as Device from "expo-device";
import { Platform, LogBox } from "react-native";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
]);

import Constants from "expo-constants";

let Notifications: any = null;
if (Constants.appOwnership !== 'expo') {
  try {
    Notifications = require("expo-notifications");
  } catch (err) {
    console.warn("expo-notifications load error:", err);
  }
} else {
  console.warn("expo-notifications is disabled in Expo Go Android. Background notifications disabled.");
}

let isOneSignalInitialized = false;
// Initialize OneSignal for cross-platform Android & iOS Push Notifications
try {
  const { OneSignal } = require('react-native-onesignal');
  const onesignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || "2c9e1cd7-bffb-4952-86bd-34b109d6aba7";
  if (onesignalAppId) {
    OneSignal.initialize(onesignalAppId);
    OneSignal.Notifications.requestPermission(true);
    isOneSignalInitialized = true;
  }
} catch (e: any) {
  console.warn("OneSignal initialization skipped:", e.message);
}

export const notificationService = {
  async setOneSignalUser(userId: string) {
    if (!isOneSignalInitialized) return;
    try {
      const { OneSignal } = require('react-native-onesignal');
      OneSignal.login(userId);
    } catch (e) {}
  },
  async registerToken(token: string, platform: string, timezone?: string): Promise<{ success: boolean }> {
    const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const { data } = await apiClient.post<{ success: boolean }>(
      ENDPOINTS.notifications.registerToken,
      { token, platform, timezone: userTimezone }
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

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || "62fd97df-6476-4894-9c0c-242103e88a85";
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    // Register token with backend
    try {
      const platform = Platform.OS; // 'ios' | 'android'
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      await this.registerToken(token, platform, userTimezone);
      console.log("Registered token successfully with backend:", token, userTimezone);
    } catch (err: any) {
      console.error("Failed to register token with backend:", err.message);
    }

    return token;
  }
};
