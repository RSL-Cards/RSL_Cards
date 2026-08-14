import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["dealer", "consumer"]).optional().default("consumer"),
  otp: z.string().length(6).optional(),
});

export const SendOtpSchema = z.object({
  email: z.string().email(),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  otp: z.string().length(6).optional(),
});

export const SendLoginOtpSchema = z.object({
  email: z.string().email(),
});

export const LoginWithOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
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

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

export const GoogleOauthSchema = z.object({
  idToken: z.string().min(1),
  role: z.enum(["dealer", "consumer"]).optional().default("consumer"),
  rawName: z.string().optional(),
  email: z.string().email().optional(),
});

export const AppleOauthSchema = z.object({
  idToken: z.string().min(1),
  role: z.enum(["dealer", "consumer"]).optional().default("consumer"),
  rawName: z.string().optional(),
  email: z.string().email().optional(),
});

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody = z.infer<typeof LoginSchema>;
export type RefreshBody = z.infer<typeof RefreshSchema>;
export type LogoutBody = z.infer<typeof LogoutSchema>;
export type OnboardingBody = z.infer<typeof OnboardingSchema>;
export type ForgotPasswordBody = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof ResetPasswordSchema>;
export type GoogleOauthBody = z.infer<typeof GoogleOauthSchema>;
export type AppleOauthBody = z.infer<typeof AppleOauthSchema>;
