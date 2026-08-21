import type { ContactSubmissionInput } from "./contact.schema.js";
import type { ContactRepository } from "./contact.repository.js";
import { EmailService } from "../email/email.service.js";
import { env } from "../../config/index.js";
import { logger } from "../../lib/logger.js";

export class ContactService {
  private readonly emailService: EmailService;

  constructor(private readonly repository: ContactRepository) {
    this.emailService = new EmailService(env);
  }

  async submit(input: ContactSubmissionInput, meta: { ipAddress: string | null; userAgent: string | null }) {
    const submission = await this.repository.create(input, meta);

    const destinationEmail = "support@rslcards.com";
    const subject = `[Support Ticket] ${input.topic} - ${input.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0057FF; margin-top: 0;">New Support Ticket</h2>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p><strong>Name:</strong> ${input.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${input.email}">${input.email}</a></p>
        <p><strong>Topic:</strong> ${input.topic}</p>
        ${input.businessName ? `<p><strong>Business:</strong> ${input.businessName}</p>` : ""}
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <h3 style="color: #333;">Message:</h3>
        <blockquote style="background: #f9f9f9; border-left: 4px solid #0057FF; margin: 0; padding: 12px 16px; font-size: 14px; white-space: pre-wrap;">${input.message}</blockquote>
      </div>
    `;
    const text = `New Support Ticket from ${input.name} (${input.email})\nTopic: ${input.topic}\n\nMessage:\n${input.message}`;

    try {
      if (env.RESEND_API_KEY) {
        await this.emailService.sendEmail({
          to: destinationEmail,
          subject,
          html,
          text,
          replyTo: input.email,
        });
        logger.info(`📧 Support email sent successfully to ${destinationEmail}`);
      } else {
        logger.info(`📧 [DEV MODE] Support email logged:\nTo: ${destinationEmail}\nSubject: ${subject}\nFrom: ${input.name} <${input.email}>\nMessage: ${input.message}`);
      }
    } catch (err) {
      logger.error({ err }, "Failed to send support email via Resend, proceeding with submission.");
    }

    return {
      success: true,
      message: "Support ticket received. Sent email to support@rslcards.com.",
      id: submission.id,
    };
  }
}
