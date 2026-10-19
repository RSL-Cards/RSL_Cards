import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "rsl:access_token",
  REFRESH_TOKEN: "rsl:refresh_token",
  USER: "rsl:user",
} as const;

// SecureStore keys may only contain letters, digits, ".", "-" and "_".
const secureKey = (key: string) => key.replace(":", ".");

// Tokens live in the iOS Keychain / Android Keystore. AsyncStorage is plain, unencrypted storage,
// so it is only used as a fallback on builds where the SecureStore native module is missing.
let secureAvailable: Promise<boolean> | null = null;
const canUseSecureStore = () =>
  (secureAvailable ??= SecureStore.isAvailableAsync().catch(() => false));

async function readToken(key: string): Promise<string | null> {
  if (!(await canUseSecureStore())) return AsyncStorage.getItem(key);
  const value = await SecureStore.getItemAsync(secureKey(key));
  if (value) return value;
  // One-time move of tokens saved by older app versions out of AsyncStorage.
  const legacy = await AsyncStorage.getItem(key);
  if (legacy) {
    await SecureStore.setItemAsync(secureKey(key), legacy);
    await AsyncStorage.removeItem(key);
  }
  return legacy;
}

async function writeToken(key: string, value: string): Promise<void> {
  if (!(await canUseSecureStore())) return AsyncStorage.setItem(key, value);
  await SecureStore.setItemAsync(secureKey(key), value);
  await AsyncStorage.removeItem(key);
}

async function removeToken(key: string): Promise<void> {
  if (await canUseSecureStore()) await SecureStore.deleteItemAsync(secureKey(key));
  await AsyncStorage.removeItem(key);
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return readToken(KEYS.ACCESS_TOKEN);
  },
  async setAccessToken(token: string): Promise<void> {
    await writeToken(KEYS.ACCESS_TOKEN, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return readToken(KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(token: string): Promise<void> {
    await writeToken(KEYS.REFRESH_TOKEN, token);
  },
  async setTokens(access: string, refresh: string): Promise<void> {
    await writeToken(KEYS.ACCESS_TOKEN, access);
    await writeToken(KEYS.REFRESH_TOKEN, refresh);
  },
  async clearTokens(): Promise<void> {
    await removeToken(KEYS.ACCESS_TOKEN);
    await removeToken(KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(KEYS.USER);
  },
  async getUser(): Promise<any | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER);
      if (!raw || raw === "undefined" || raw === "null") return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[tokenStorage] Error reading user:", e);
      return null;
    }
  },
  async setUser(user: any): Promise<void> {
    try {
      if (!user) {
        await AsyncStorage.removeItem(KEYS.USER);
      } else {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
      }
    } catch (e) {
      console.warn("[tokenStorage] Error saving user:", e);
    }
  },
};
