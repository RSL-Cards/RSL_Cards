import AsyncStorage from "@react-native-async-storage/async-storage";

/** Shared key for Gemini / third-party AI processing consent (EU AI Act + Apple 5.1.2). */
export const AI_CONSENT_STORAGE_KEY = "@rsl_ai_data_consent_accepted";

export async function hasAiConsent(): Promise<boolean> {
  const value = await AsyncStorage.getItem(AI_CONSENT_STORAGE_KEY);
  return value === "true";
}

export async function acceptAiConsent(): Promise<void> {
  await AsyncStorage.setItem(AI_CONSENT_STORAGE_KEY, "true");
}
