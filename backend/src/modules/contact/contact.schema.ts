import { Type, type Static } from "@sinclair/typebox";

export const ContactSubmissionSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  email: Type.String({ minLength: 3, maxLength: 254 }),
  businessName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  topic: Type.Optional(Type.String()),
  message: Type.String({ minLength: 5, maxLength: 5000 }),
});

export type ContactSubmissionInput = Static<typeof ContactSubmissionSchema> & {
  topic?: string;
};
