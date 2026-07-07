import { z } from "zod";

export const ContactTopicSchema = z.enum([
  "inventory",
  "dealer-demo",
  "pricing",
  "support",
  "partnership",
]);

export const ContactSubmissionSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .trim()
    .min(2, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
  businessName: z
    .string({ required_error: "Business type is required." })
    .trim()
    .min(2, "Business type is required.")
    .max(150, "Business type must be 150 characters or fewer."),
  topic: ContactTopicSchema.default("inventory"),
  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message must be 5000 characters or fewer."),
});

export type ContactSubmissionInput = z.infer<typeof ContactSubmissionSchema>;
