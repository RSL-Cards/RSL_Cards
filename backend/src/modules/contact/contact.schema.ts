import { z } from "zod";

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
  businessName: z.string().optional().nullable(),
  topic: z.string().default("General Question"),
  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(5, "Message must be at least 5 characters.")
    .max(5000, "Message must be 5000 characters or fewer."),
});

export type ContactSubmissionInput = z.infer<typeof ContactSubmissionSchema>;
