import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ACCESS_TOKEN: "rsl:access_token",
  REFRESH_TOKEN: "rsl:refresh_token",
  USER: "rsl:user",
} as const;

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  },
  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
  },
  async setTokens(access: string, refresh: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, access);
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, refresh);
  },
  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(KEYS.USER);
  },
  async getUser(): Promise<any | null> {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
};
