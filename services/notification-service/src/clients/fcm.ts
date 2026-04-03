import type { Env } from "../config/env.js";

export async function sendPush(
  env: Env,
  token: string,
  title: string,
  body: string,
  data?: object,
  logger?: { info: (o: Record<string, unknown>) => void },
): Promise<void> {
  if (!env.FIREBASE_SERVICE_ACCOUNT || env.FIREBASE_SERVICE_ACCOUNT.length === 0) {
    logger?.info({ msg: "FCM mock: would send to " + token.slice(0, 10) });
    void title;
    void body;
    void data;
    return;
  }
  logger?.info({ msg: "FCM send stub — wire firebase-admin", title });
}
