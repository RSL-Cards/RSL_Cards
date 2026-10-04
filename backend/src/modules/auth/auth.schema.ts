import { Type, type Static } from "@sinclair/typebox";

const Email = Type.String({ minLength: 3, maxLength: 254 });
const Otp = Type.String({ minLength: 6, maxLength: 6 });
const Role = Type.Union([Type.Literal("dealer"), Type.Literal("consumer")]);

export const RegisterSchema = Type.Object({
  email: Email,
  password: Type.String({ minLength: 8 }),
  role: Type.Optional(Role),
  otp: Type.Optional(Otp),
});

export const SendOtpSchema = Type.Object({
  email: Email,
});

export const VerifyOtpSchema = Type.Object({
  email: Email,
  otp: Otp,
});

export const LoginSchema = Type.Object({
  email: Email,
  password: Type.Optional(Type.String()),
  otp: Type.Optional(Otp),
});

export const SendLoginOtpSchema = Type.Object({
  email: Email,
});

export const LoginWithOtpSchema = Type.Object({
  email: Email,
  otp: Otp,
});

export const RefreshSchema = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
});

export const LogoutSchema = Type.Object({
  refreshToken: Type.Optional(Type.String()),
});

export const OnboardingSchema = Type.Object({
  sports: Type.Array(Type.String(), { minItems: 1 }),
  sellChannels: Type.Array(Type.String(), { minItems: 1 }),
  paymentMethods: Type.Optional(
    Type.Array(
      Type.Object({
        type: Type.Union([
          Type.Literal("venmo"),
          Type.Literal("cashapp"),
          Type.Literal("zelle"),
          Type.Literal("paypal"),
        ]),
        handle: Type.String({ minLength: 1 }),
        isDefault: Type.Optional(Type.Boolean()),
      }),
    ),
  ),
});

export const ForgotPasswordSchema = Type.Object({
  email: Email,
});

export const ResetPasswordSchema = Type.Object({
  email: Email,
  otp: Otp,
  newPassword: Type.String({ minLength: 8 }),
});

export const GoogleOauthSchema = Type.Object({
  idToken: Type.String({ minLength: 1 }),
  role: Type.Optional(Role),
  rawName: Type.Optional(Type.String()),
  email: Type.Optional(Email),
});

export const AppleOauthSchema = Type.Object({
  idToken: Type.String({ minLength: 1 }),
  role: Type.Optional(Role),
  rawName: Type.Optional(Type.String()),
  email: Type.Optional(Email),
});

export type RegisterBody = Static<typeof RegisterSchema> & { role?: "dealer" | "consumer" };
export type LoginBody = Static<typeof LoginSchema>;
export type RefreshBody = Static<typeof RefreshSchema>;
export type LogoutBody = Static<typeof LogoutSchema>;
export type OnboardingBody = Static<typeof OnboardingSchema>;
export type ForgotPasswordBody = Static<typeof ForgotPasswordSchema>;
export type ResetPasswordBody = Static<typeof ResetPasswordSchema>;
export type GoogleOauthBody = Static<typeof GoogleOauthSchema> & { role?: "dealer" | "consumer" };
export type AppleOauthBody = Static<typeof AppleOauthSchema> & { role?: "dealer" | "consumer" };
