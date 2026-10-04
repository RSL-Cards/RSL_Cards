import { Type } from "@sinclair/typebox";
import { parseBody } from "../../lib/validate.js";
import { EmailService, type EmailTemplateName } from "./email.service.js";

const TestEmailSchema = Type.Object({
  to: Type.Union([
    Type.String({ minLength: 3 }),
    Type.Array(Type.String({ minLength: 3 }), { minItems: 1 }),
  ]),
  template: Type.Optional(
    Type.Union([
      Type.Literal("welcome"),
      Type.Literal("emailVerification"),
      Type.Literal("passwordReset"),
      Type.Literal("orderConfirmation"),
      Type.Literal("deliveryStatus"),
    ]),
  ),
  payload: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export class EmailController {
  constructor(private readonly service: EmailService) {}

  sendTestEmail = async ({ body }: { body: any }) => {
    const data = parseBody(TestEmailSchema, body);
    const recipients = Array.isArray(data.to) ? data.to : [data.to];
    const template = (data.template ?? "welcome") as EmailTemplateName;
    const results = [];

    for (const recipient of recipients) {
      const result = await this.service.sendTestEmail(
        template,
        recipient,
        data.payload ?? {},
      );
      results.push({ to: recipient, result });
    }

    return {
      success: true,
      template,
      results,
    };
  };
}
