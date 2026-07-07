import type { ContactSubmissionInput } from "./contact.schema.js";
import type { ContactRepository } from "./contact.repository.js";

export class ContactService {
  constructor(private readonly repository: ContactRepository) {}

  async submit(input: ContactSubmissionInput, meta: { ipAddress: string | null; userAgent: string | null }) {
    const submission = await this.repository.create(input, meta);

    return {
      success: true,
      message: "Contact request received.",
      id: submission.id,
    };
  }
}

