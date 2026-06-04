import type { Env } from "../../config/index.js";
import { emailTemplates } from "./email.templates.js";

export type EmailTemplateName =
  | "welcome"
  | "emailVerification"
  | "passwordReset"
  | "orderConfirmation"
  | "deliveryStatus";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

type EmailEnv = Env & {
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
  APP_WEB_URL?: string;
};
type ResendResponse = {
  id?: string;
  message?: string;
  error?: string;
};
export class EmailService {
  private readonly resendUrl = "https://api.resend.com/emails";

  constructor(private readonly env: EmailEnv) { }

  private get from() {
    return `${this.env.RESEND_FROM_NAME || "RSL Cards"} <${this.env.RESEND_FROM_EMAIL || "noreply@rslcardspro.com"}>`;
  }

  private get appWebUrl() {
    return this.env.APP_WEB_URL || "https://rslcardspro.com";
  }

  private ensureConfigured() {
    if (!this.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
  }

async sendEmail(input: SendEmailInput) {
  console.log("📧 sendEmail() called");
  console.log("To:", input.to);
  console.log("Subject:", input.subject);

  this.ensureConfigured();

  console.log(
    "🔑 RESEND_API_KEY exists:",
    !!this.env.RESEND_API_KEY
  );
  console.log("📨 From:", this.from);

  const response = await fetch(this.resendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${this.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: this.from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
    }),
  });

const rawData: unknown = await response.json().catch(() => null);

const data: ResendResponse | null =
  typeof rawData === "object" && rawData !== null
    ? rawData as ResendResponse
    : null;

  console.log("📨 RESEND RESPONSE");
  console.log("Status:", response.status);
  console.log("Body:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Resend request failed with ${response.status}`;

    throw new Error(message);
  }

  return data;
}

  async sendWelcomeEmail(to: string, input: { displayName?: string | null } = {}) {
    const template = emailTemplates.welcome({
      displayName: input.displayName,
      appUrl: this.appWebUrl,
    });

    return this.sendEmail({ to, ...template });
  }

  async sendEmailVerification(
    to: string,
    input: { displayName?: string | null; token?: string; code?: string | null; verificationUrl?: string },
  ) {
    const verificationUrl =
      input.verificationUrl ||
      `${this.appWebUrl}/verify-email?token=${encodeURIComponent(input.token || "")}`;
    const template = emailTemplates.emailVerification({
      displayName: input.displayName,
      verificationUrl,
      code: input.code,
    });

    return this.sendEmail({ to, ...template });
  }

  async sendPasswordReset(
    to: string,
    input: {
      displayName?: string | null;
      otp?: string | null;
      token?: string;
      resetUrl?: string;
      expiresInMinutes?: number;
    },
  ) {
    const resetUrl =
      input.resetUrl ||
      (input.token
        ? `${this.appWebUrl}/reset-password?token=${encodeURIComponent(input.token)}`
        : null);
    const template = emailTemplates.passwordReset({
      displayName: input.displayName,
      resetUrl,
      otp: input.otp,
      expiresInMinutes: input.expiresInMinutes,
    });

    return this.sendEmail({ to, ...template });
  }

  async sendOrderConfirmation(
    to: string,
    input: {
      displayName?: string | null;
      orderId: string;
      itemName: string;
      total: string;
      orderUrl?: string | null;
    },
  ) {
    const template = emailTemplates.orderConfirmation(input);
    return this.sendEmail({ to, ...template });
  }

  async sendDeliveryStatusUpdate(
    to: string,
    input: {
      displayName?: string | null;
      orderId: string;
      status: string;
      trackingNumber?: string | null;
      trackingUrl?: string | null;
    },
  ) {
    const template = emailTemplates.deliveryStatus(input);
    return this.sendEmail({ to, ...template });
  }

  async sendTestEmail(templateName: EmailTemplateName, to: string, payload: any = {}) {
    if (templateName === "welcome") {
      return this.sendWelcomeEmail(to, payload);
    }

    if (templateName === "emailVerification") {
      return this.sendEmailVerification(to, {
        verificationUrl: payload.verificationUrl || `${this.appWebUrl}/verify-email?token=test-token`,
        code: payload.code || "123456",
        displayName: payload.displayName,
      });
    }

    if (templateName === "passwordReset") {
      return this.sendPasswordReset(to, {
        otp: payload.otp || "123456",
        displayName: payload.displayName,
        expiresInMinutes: payload.expiresInMinutes || 15,
      });
    }

    if (templateName === "orderConfirmation") {
      return this.sendOrderConfirmation(to, {
        displayName: payload.displayName,
        orderId: payload.orderId || "RSL-TEST-1001",
        itemName: payload.itemName || "2023 Panini Prizm Demo Card PSA 10",
        total: payload.total || "$149.00",
        orderUrl: payload.orderUrl || `${this.appWebUrl}/orders/RSL-TEST-1001`,
      });
    }

    return this.sendDeliveryStatusUpdate(to, {
      displayName: payload.displayName,
      orderId: payload.orderId || "RSL-TEST-1001",
      status: payload.status || "In transit",
      trackingNumber: payload.trackingNumber || "1Z999AA10123456784",
      trackingUrl: payload.trackingUrl || "https://www.ups.com/track",
    });
  }
}
