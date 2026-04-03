import type { Env } from "../config/env.js";

export async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
  logger?: { info: (o: Record<string, unknown>) => void },
): Promise<void> {
  if (!env.RESEND_API_KEY || env.RESEND_API_KEY.length === 0) {
    logger?.info({ msg: "Email mock: would send to " + to });
    void subject;
    void html;
    return;
  }
  logger?.info({ msg: "Resend send stub", to });
}
