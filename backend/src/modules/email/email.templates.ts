export type EmailTemplateResult = {
  subject: string;
  html: string;
  text: string;
};

type WelcomeEmailInput = {
  displayName?: string | null;
  appUrl: string;
};

type EmailVerificationInput = {
  displayName?: string | null;
  verificationUrl: string;
  code?: string | null;
};

type PasswordResetInput = {
  displayName?: string | null;
  resetUrl?: string | null;
  otp?: string | null;
  expiresInMinutes?: number;
};

type OrderConfirmationInput = {
  displayName?: string | null;
  orderId: string;
  itemName: string;
  total: string;
  orderUrl?: string | null;
};

type DeliveryStatusInput = {
  displayName?: string | null;
  orderId: string;
  status: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

type NotificationAlertInput = {
  displayName?: string | null;
  alertTitle: string;
  alertBody: string;
  actionUrl?: string | null;
  actionText?: string | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const greeting = (displayName?: string | null) =>
  displayName ? `Hi ${escapeHtml(displayName)},` : "Hi,";

const baseTemplate = (title: string, preview: string, body: string) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f5f7fb;color:#111827;font-family:Inter,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #e5e7eb;">
                <div style="font-size:20px;font-weight:800;color:#111827;">RSL Cards</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:#f8fafc;color:#6b7280;font-size:12px;line-height:18px;">
                You are receiving this email from RSL Cards. If you did not expect it, you can safely ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const button = (href: string, label: string) => `
  <a href="${escapeHtml(href)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:12px 18px;">
    ${escapeHtml(label)}
  </a>`;

export const emailTemplates = {
  welcome(input: WelcomeEmailInput): EmailTemplateResult {
    const subject = "Welcome to RSL Cards";
    const text = `${input.displayName ? `Hi ${input.displayName},` : "Hi,"}\n\nWelcome to RSL Cards. Your account is ready.\n\nOpen your dashboard: ${input.appUrl}`;
    const html = baseTemplate(
      subject,
      "Your RSL Cards account is ready.",
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">Welcome to RSL Cards</h1>
        <p style="margin:0 0 16px;color:#374151;line-height:24px;">${greeting(input.displayName)}</p>
        <p style="margin:0 0 24px;color:#374151;line-height:24px;">Your account is ready. You can now manage inventory, track deals, and keep your card business organized from one dashboard.</p>
        ${button(input.appUrl, "Open Dashboard")}
      `,
    );

    return { subject, html, text };
  },

  emailVerification(input: EmailVerificationInput): EmailTemplateResult {
    const subject = "Verify your RSL Cards email";
    const codeLine = input.code ? `\nVerification code: ${input.code}` : "";
    const text = `${input.displayName ? `Hi ${input.displayName},` : "Hi,"}\n\nVerify your email address using this link:\n${input.verificationUrl}${codeLine}`;
    const html = baseTemplate(
      subject,
      "Confirm your email address for RSL Cards.",
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">Verify your email</h1>
        <p style="margin:0 0 16px;color:#374151;line-height:24px;">${greeting(input.displayName)}</p>
        <p style="margin:0 0 24px;color:#374151;line-height:24px;">Please confirm this email address so we can keep your RSL Cards account secure.</p>
        ${button(input.verificationUrl, "Verify Email")}
        ${
          input.code
            ? `<p style="margin:24px 0 0;color:#374151;line-height:24px;">Code: <strong>${escapeHtml(input.code)}</strong></p>`
            : ""
        }
      `,
    );

    return { subject, html, text };
  },

  passwordReset(input: PasswordResetInput): EmailTemplateResult {
    const expires = input.expiresInMinutes ?? 15;
    const subject = "Reset your RSL Cards password";
    const action = input.resetUrl
      ? `Reset your password: ${input.resetUrl}`
      : `Use this OTP to reset your password: ${input.otp}`;
    const text = `${input.displayName ? `Hi ${input.displayName},` : "Hi,"}\n\n${action}\n\nThis reset expires in ${expires} minutes.`;
    const html = baseTemplate(
      subject,
      "Password reset instructions for your RSL Cards account.",
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">Reset your password</h1>
        <p style="margin:0 0 16px;color:#374151;line-height:24px;">${greeting(input.displayName)}</p>
        <p style="margin:0 0 24px;color:#374151;line-height:24px;">We received a request to reset your password. This reset expires in ${expires} minutes.</p>
        ${
          input.resetUrl
            ? button(input.resetUrl, "Reset Password")
            : `<div style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:12px 18px;font-size:24px;font-weight:800;letter-spacing:4px;">${escapeHtml(input.otp ?? "")}</div>`
        }
      `,
    );

    return { subject, html, text };
  },

  orderConfirmation(input: OrderConfirmationInput): EmailTemplateResult {
    const subject = `Order confirmation ${input.orderId}`;
    const text = `${input.displayName ? `Hi ${input.displayName},` : "Hi,"}\n\nYour order is confirmed.\nOrder: ${input.orderId}\nItem: ${input.itemName}\nTotal: ${input.total}${input.orderUrl ? `\nView order: ${input.orderUrl}` : ""}`;
    const html = baseTemplate(
      subject,
      "Your RSL Cards order is confirmed.",
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">Order confirmed</h1>
        <p style="margin:0 0 16px;color:#374151;line-height:24px;">${greeting(input.displayName)}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:10px;">
          <tr><td style="padding:12px;color:#6b7280;">Order</td><td style="padding:12px;text-align:right;font-weight:700;">${escapeHtml(input.orderId)}</td></tr>
          <tr><td style="padding:12px;color:#6b7280;border-top:1px solid #e5e7eb;">Item</td><td style="padding:12px;text-align:right;border-top:1px solid #e5e7eb;">${escapeHtml(input.itemName)}</td></tr>
          <tr><td style="padding:12px;color:#6b7280;border-top:1px solid #e5e7eb;">Total</td><td style="padding:12px;text-align:right;border-top:1px solid #e5e7eb;font-weight:700;">${escapeHtml(input.total)}</td></tr>
        </table>
        ${input.orderUrl ? button(input.orderUrl, "View Order") : ""}
      `,
    );

    return { subject, html, text };
  },

  deliveryStatus(input: DeliveryStatusInput): EmailTemplateResult {
    const subject = `Update on your order #${input.orderId}`;
    
    const text = `${greeting(input.displayName)}\n\nThe status of your order #${input.orderId} is now: ${input.status}.${
      input.trackingNumber ? `\nTracking Number: ${input.trackingNumber}` : ""
    }${
      input.trackingUrl ? `\nTrack your package: ${input.trackingUrl}` : ""
    }\n\nThanks,\nThe RSL Cards Team`;

    const html = baseTemplate(
      "Delivery Status Update",
      `Update on order #${input.orderId}`,
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">Order Update</h1>
        <p style="margin:0 0 24px;color:#374151;line-height:24px;">The status of your order <strong>#${escapeHtml(input.orderId)}</strong> is now: <strong>${escapeHtml(input.status)}</strong>.</p>
        ${
          input.trackingNumber
            ? `<p style="margin:0 0 16px;color:#374151;line-height:24px;">Tracking Number: <strong>${escapeHtml(input.trackingNumber)}</strong></p>`
            : ""
        }
        ${
          input.trackingUrl
            ? button(input.trackingUrl, "Track Package")
            : ""
        }
      `
    );

    return { subject, html, text };
  },

  notificationAlert(input: NotificationAlertInput): EmailTemplateResult {
    const subject = input.alertTitle;
    
    const text = `${greeting(input.displayName)}\n\n${input.alertBody}${
      input.actionUrl ? `\n\n${input.actionText || "View Details"}: ${input.actionUrl}` : ""
    }\n\nManage your notification preferences in the RSL Cards app settings.\nThanks,\nThe RSL Cards Team`;

    const html = baseTemplate(
      input.alertTitle,
      "RSL Cards Alert",
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">${escapeHtml(input.alertTitle)}</h1>
        <p style="margin:0 0 24px;color:#374151;line-height:24px;white-space:pre-wrap;">${escapeHtml(input.alertBody)}</p>
        ${
          input.actionUrl
            ? button(input.actionUrl, input.actionText || "View Details")
            : ""
        }
        <p style="margin-top:24px;color:#6b7280;font-size:12px;">You can manage your notification preferences in your RSL Cards account settings.</p>
      `
    );

    return { subject, html, text };
  },
};
