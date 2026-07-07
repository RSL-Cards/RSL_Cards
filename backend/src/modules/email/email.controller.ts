import { z } from "zod";
import { EmailService, type EmailTemplateName } from "./email.service.js";

const TestEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  template: z
    .enum([
      "welcome",
      "emailVerification",
      "passwordReset",
      "orderConfirmation",
      "deliveryStatus",
    ])
    .default("welcome"),
  payload: z.record(z.any()).optional().default({}),
});

export class EmailController {
  constructor(private readonly service: EmailService) {}

  sendTestEmail = async ({ body }: { body: any }) => {
    const data = TestEmailSchema.parse(body);
    const recipients = Array.isArray(data.to) ? data.to : [data.to];
    const results = [];

    for (const recipient of recipients) {
      const result = await this.service.sendTestEmail(
        data.template as EmailTemplateName,
        recipient,
        data.payload,
      );
      results.push({ to: recipient, result });
    }

    return {
      success: true,
      template: data.template,
      results,
    };
  };
}
