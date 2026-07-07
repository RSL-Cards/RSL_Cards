import { randomUUID } from "node:crypto";
import { logger } from "../../lib/logger.js";
import type { ContactSubmissionInput } from "./contact.schema.js";

export type ContactSubmissionRecord = ContactSubmissionInput & {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export class ContactRepository {
  async create(input: ContactSubmissionInput, meta: { ipAddress: string | null; userAgent: string | null }) {
    const submission: ContactSubmissionRecord = {
      id: randomUUID(),
      ...input,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      createdAt: new Date().toISOString(),
    };

    logger.info(
      {
        contactSubmissionId: submission.id,
        email: submission.email,
        topic: submission.topic,
        businessName: submission.businessName || null,
      },
      "New website contact submission",
    );

    return submission;
  }
}

