import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["dealer", "consumer"]).optional().default("consumer"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RefreshSchema = z.object({
  refreshToken: z.string(),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export const OnboardingSchema = z.object({
  sports: z.array(z.string()).min(1),
  sellChannels: z.array(z.string()).min(1),
  paymentMethods: z
    .array(
      z.object({
        type: z.enum(["venmo", "cashapp", "zelle", "paypal"]),
        handle: z.string().min(1),
        isDefault: z.boolean().optional().default(false),
      }),
    )
    .optional()
    .default([]),
});

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody = z.infer<typeof LoginSchema>;
export type RefreshBody = z.infer<typeof RefreshSchema>;
export type LogoutBody = z.infer<typeof LogoutSchema>;
export type OnboardingBody = z.infer<typeof OnboardingSchema>;
