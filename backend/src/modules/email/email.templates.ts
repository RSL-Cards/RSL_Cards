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

export type CompRefreshReportInput = {
  batchId: string;
  totalInventoryCardsCount?: number;
  totalEnqueued: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  totalSoldStored: number;
  totalActiveStored: number;
  activeDailyLogsCount: number;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  failedItems?: Array<{ itemName: string; gradeKey: string; error: string }>;
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

  passwordResetSuccess(input: { displayName?: string | null }): EmailTemplateResult {
    const subject = "Your RSL Cards password was successfully changed";
    const text = `${input.displayName ? `Hi ${input.displayName},` : "Hi,"}\n\nYour RSL Cards password has been successfully reset.\nIf you did not make this change, please contact support immediately to secure your account.`;
    const html = baseTemplate(
      subject,
      "Your password reset was successful.",
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;color:#10b981;">Password Reset Successful</h1>
        <p style="margin:0 0 16px;color:#374151;line-height:24px;">${greeting(input.displayName)}</p>
        <p style="margin:0 0 24px;color:#374151;line-height:24px;">Your RSL Cards account password was changed successfully.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;color:#166534;font-size:14px;line-height:20px;">
          If you did not initiate this change, please contact support immediately or reset your password again to secure your account.
        </div>
      `,
    );
    return { subject, html, text };
  },

  passwordResetFailed(input: { displayName?: string | null; reason?: string }): EmailTemplateResult {
    const subject = "Security Alert: Failed password reset attempt on RSL Cards";
    const text = `${input.displayName ? `Hi ${input.displayName},` : "Hi,"}\n\nThere was a failed password reset attempt on your RSL Cards account (${input.reason || "Invalid or expired OTP"}).\nIf this was you, please request a new verification code. If you did not request this, your account is safe, but we recommend checking your security.`;
    const html = baseTemplate(
      subject,
      "Security Alert: Failed password reset attempt.",
      `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;color:#ef4444;">Security Alert</h1>
        <p style="margin:0 0 16px;color:#374151;line-height:24px;">${greeting(input.displayName)}</p>
        <p style="margin:0 0 24px;color:#374151;line-height:24px;">A password reset attempt on your RSL Cards account failed (${escapeHtml(input.reason || "Invalid or expired verification code")}).</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;color:#991b1b;font-size:14px;line-height:20px;">
          If you were trying to reset your password, please request a new code. If you did not make this request, someone else may have entered your email address by mistake.
        </div>
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

  compRefreshReport(input: CompRefreshReportInput): EmailTemplateResult {
    const totalInvCards = input.totalInventoryCardsCount ?? input.totalEnqueued;
    const subject = `📊 RSL Cards Comp Refresh Report: ${input.successCount}/${input.totalEnqueued} Variants Updated (${totalInvCards} Inventory Cards)`;

    const text = `RSL Cards Admin Report - Comp Refresh Execution
Batch ID: ${input.batchId}
Start Time: ${input.startTime}
End Time: ${input.endTime}
Duration: ${input.durationSeconds} seconds

SUMMARY METRICS:
- Total Inventory Cards in DB: ${totalInvCards}
- Unique Card/Grade Variations Evaluated: ${input.totalEnqueued}
- Successful Refreshes: ${input.successCount}
- Failed / Errors: ${input.failedCount}
- Total Sold Listings Stored: ${input.totalSoldStored}
- Total Active Listings Stored: ${input.totalActiveStored}
- System Active Daily Logs: ${input.activeDailyLogsCount}
${
  input.failedItems && input.failedItems.length > 0
    ? `\nFAILED / ERROR ITEMS (${input.failedItems.length}):\n${input.failedItems.map((f: { itemName: string; gradeKey: string; error: string }) => `- ${f.itemName} (${f.gradeKey}): ${f.error}`).join("\n")}`
    : "\n🎉 All card comps refreshed successfully with 0 errors!"
}

Thanks,
RSL Cards System Worker`;

    const html = baseTemplate(
      "RSL Cards - Comp Refresh & System Report",
      `Batch ${input.batchId} completed: ${input.successCount}/${input.totalEnqueued} variants updated across ${totalInvCards} active inventory cards`,
      `
        <div style="background:#0F172A;border-radius:12px;padding:20px;color:#F8FAFC;margin-bottom:24px;">
          <h2 style="margin:0 0 8px;font-size:20px;color:#38BDF8;">📊 Comp Refresh & System Execution Report</h2>
          <p style="margin:0;font-size:13px;color:#94A3B8;">Batch ID: <code>${escapeHtml(input.batchId)}</code></p>
          <p style="margin:4px 0 0;font-size:12px;color:#64748B;">
            Duration: <strong>${input.durationSeconds}s</strong> | ${escapeHtml(input.startTime)} &rarr; ${escapeHtml(input.endTime)}
          </p>
        </div>

        <!-- 3-Column Key Metrics Banner -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
          <tr>
            <td width="33.3%" style="padding-right:6px;vertical-align:top;">
              <div style="background:#F1F5F9;border-radius:10px;padding:14px;border:1px solid #E2E8F0;">
                <div style="font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;">Inventory Cards</div>
                <div style="font-size:24px;font-weight:900;color:#0F172A;margin-top:2px;">${totalInvCards}</div>
                <div style="font-size:11px;color:#64748B;margin-top:2px;">Active in DB</div>
              </div>
            </td>
            <td width="33.3%" style="padding-left:3px;padding-right:3px;vertical-align:top;">
              <div style="background:#F1F5F9;border-radius:10px;padding:14px;border:1px solid #E2E8F0;">
                <div style="font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;">Unique Variants</div>
                <div style="font-size:24px;font-weight:900;color:#2563EB;margin-top:2px;">${input.totalEnqueued}</div>
                <div style="font-size:11px;color:#16A34A;margin-top:2px;">✅ ${input.successCount} Succeeded</div>
              </div>
            </td>
            <td width="33.3%" style="padding-left:6px;vertical-align:top;">
              <div style="background:${input.failedCount > 0 ? '#FEF2F2' : '#F0FDF4'};border-radius:10px;padding:14px;border:1px solid ${input.failedCount > 0 ? '#FECACA' : '#BBF7D0'};">
                <div style="font-size:11px;color:${input.failedCount > 0 ? '#991B1B' : '#166534'};font-weight:700;text-transform:uppercase;">Errors Gotten</div>
                <div style="font-size:24px;font-weight:900;color:${input.failedCount > 0 ? '#DC2626' : '#16A34A'};margin-top:2px;">${input.failedCount}</div>
                <div style="font-size:11px;color:${input.failedCount > 0 ? '#DC2626' : '#16A34A'};margin-top:2px;">${input.failedCount > 0 ? '❌ Action Required' : '🎉 Zero Errors'}</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Listings Stored Card -->
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;margin-bottom:20px;">
          <div style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;margin-bottom:6px;">💾 Data Stored in Database</div>
          <div style="font-size:22px;font-weight:800;color:#1E293B;">${(input.totalSoldStored + input.totalActiveStored).toLocaleString()} Total Listings</div>
          <div style="font-size:12px;color:#475569;margin-top:6px;display:flex;gap:16px;">
            <span>🛒 Sold Listings: <strong style="color:#0F172A;">${input.totalSoldStored.toLocaleString()}</strong></span>
            &nbsp;•&nbsp;
            <span>🏷️ Active Listings: <strong style="color:#0F172A;">${input.totalActiveStored.toLocaleString()}</strong></span>
          </div>
        </div>

        <div style="background:#EFF6FF;border-left:4px solid #3B82F6;padding:14px;border-radius:6px;margin-bottom:24px;">
          <div style="font-weight:700;color:#1E40AF;font-size:13px;">📋 System Active Logs Status</div>
          <div style="font-size:13px;color:#1E3A8A;margin-top:4px;">Currently <strong>${input.activeDailyLogsCount}</strong> active daily show logs open across all dealers.</div>
        </div>

        ${
          input.failedItems && input.failedItems.length > 0
            ? `
              <h3 style="font-size:16px;color:#DC2626;margin:0 0 12px;">Failed / Error Items (${input.failedItems.length})</h3>
              <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-size:12px;border:1px solid #E2E8F0;">
                <thead>
                  <tr style="background:#FEF2F2;text-align:left;color:#991B1B;">
                    <th style="border-bottom:1px solid #FECACA;">Card Name</th>
                    <th style="border-bottom:1px solid #FECACA;">Grade Key</th>
                    <th style="border-bottom:1px solid #FECACA;">Error Reason</th>
                  </tr>
                </thead>
                <tbody>
                  ${input.failedItems
                    .map(
                      (f: { itemName: string; gradeKey: string; error: string }) => `
                        <tr>
                          <td style="border-bottom:1px solid #F1F5F9;font-weight:600;">${escapeHtml(f.itemName)}</td>
                          <td style="border-bottom:1px solid #F1F5F9;">${escapeHtml(f.gradeKey)}</td>
                          <td style="border-bottom:1px solid #F1F5F9;color:#DC2626;">${escapeHtml(f.error)}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            `
            : `<div style="background:#F0FDF4;border:1px solid #BBF7D0;color:#166534;padding:14px;border-radius:8px;font-weight:600;font-size:13px;text-align:center;">🎉 All card variants were refreshed and stored successfully with zero errors!</div>`
        }
      `
    );

    return { subject, html, text };
  },
};
