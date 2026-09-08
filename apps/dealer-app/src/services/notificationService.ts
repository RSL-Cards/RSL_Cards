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

function initOneSignal() {
  if (isOneSignalInitialized) return;
  if (Constants.appOwnership === "expo") {
    return;
  }
  try {
    const mod = require("react-native-onesignal");
    const OneSignal = mod?.OneSignal || mod?.default;
    const onesignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || "2c9e1cd7-bffb-4952-86bd-34b109d6aba7";
    if (OneSignal && typeof OneSignal.initialize === "function" && onesignalAppId) {
      OneSignal.initialize(onesignalAppId);
      isOneSignalInitialized = true;
    }
  } catch (e: any) {
    console.warn("[OneSignal] Skipped:", e?.message);
  }
}

export const notificationService = {
  async initOneSignalPermissions() {
    initOneSignal();
    if (!isOneSignalInitialized) return;
    try {
      const mod = require("react-native-onesignal");
      const OneSignal = mod?.OneSignal || mod?.default;
      if (OneSignal?.Notifications?.requestPermission) {
        OneSignal.Notifications.requestPermission(true);
      }
    } catch (e) {}
  },

  async setOneSignalUser(userId: string) {
    initOneSignal();
    if (!isOneSignalInitialized) return;
    try {
      const mod = require("react-native-onesignal");
      const OneSignal = mod?.OneSignal || mod?.default;
      if (OneSignal?.login) {
        OneSignal.login(userId);
      }
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

  async requestNotificationPermissions(): Promise<boolean> {
    if (!Notifications) {
      console.warn("Push notifications are disabled in this environment");
      return false;
    }

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "RSL Card Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0057FF",
        });
      }

      const settings = (await Notifications.getPermissionsAsync()) as any;
      let isGranted = settings.granted;

      if (!isGranted && settings.canAskAgain !== false) {
        const requestResult = (await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        })) as any;
        isGranted = requestResult?.granted;
      }

      return !!isGranted;
    } catch (err: any) {
      console.warn("Failed to request notification permissions:", err?.message);
      return false;
    }
  },

  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    const isGranted = await this.requestNotificationPermissions();
    if (!isGranted) {
      console.warn("Notification permission not granted");
      return;
    }

    if (!Device.isDevice) {
      console.log("[Notifications] Simulator detected: Permissions granted, push token registration requires physical device.");
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || "62fd97df-6476-4894-9c0c-242103e88a85";
    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      
      // Register token with backend
      const platform = Platform.OS; // 'ios' | 'android'
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      await this.registerToken(token, platform, userTimezone);
      console.log("Registered token successfully with backend:", token, userTimezone);
      return token;
    } catch (err: any) {
      console.error("Failed to register token with backend:", err.message);
    }
  }
};
