import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "dev", "qa", "production", "test"]),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  DATABASE_URL_READ_REPLICA: z.string().min(1),
  DB_POOL_MIN: z.coerce.number().optional().default(2),
  DB_POOL_MAX: z.coerce.number().optional().default(10),
  REDIS_URL: z.string().min(1),
  REDIS_PASSWORD: z.string().optional().default(""),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  INTERNAL_SERVICE_KEY: z.string().min(8),
  AUTH_SERVICE_PORT: z.coerce.number(),
  USER_SERVICE_PORT: z.coerce.number(),
  INVENTORY_SERVICE_PORT: z.coerce.number(),
  TRANSACTION_SERVICE_PORT: z.coerce.number(),
  LISTING_SERVICE_PORT: z.coerce.number(),
  CARD_DB_SERVICE_PORT: z.coerce.number(),
  AI_NARRATIVE_SERVICE_PORT: z.coerce.number(),
  NOTIFICATION_SERVICE_PORT: z.coerce.number(),
  ANALYTICS_SERVICE_PORT: z.coerce.number(),
  ADMIN_SERVICE_PORT: z.coerce.number(),
  XIMILAR_API_KEY: z.string().optional().default(""),
  EBAY_ENV: z.enum(["sandbox", "production"]).optional().default("sandbox"),
  EBAY_MARKETPLACE_ID: z.string().optional().default("EBAY_US"),
  EBAY_SANDBOX_CLIENT_ID: z.string().optional().default(""),
  EBAY_SANDBOX_CLIENT_SECRET: z.string().optional().default(""),
  EBAY_SANDBOX_API_URL: z
    .string()
    .optional()
    .default("https://api.sandbox.ebay.com"),
  EBAY_SANDBOX_TOKEN_URL: z
    .string()
    .optional()
    .default("https://api.sandbox.ebay.com/identity/v1/oauth2/token"),
  EBAY_SANDBOX_AUTH_URL: z
    .string()
    .optional()
    .default("https://auth.sandbox.ebay.com/oauth2/authorize"),
  EBAY_SANDBOX_RU_NAME: z.string().optional().default(""),
  EBAY_PROD_CLIENT_ID: z.string().optional().default(""),
  EBAY_PROD_CLIENT_SECRET: z.string().optional().default(""),
  EBAY_PROD_API_URL: z.string().optional().default("https://api.ebay.com"),
  EBAY_PROD_TOKEN_URL: z
    .string()
    .optional()
    .default("https://api.ebay.com/identity/v1/oauth2/token"),
  EBAY_PROD_AUTH_URL: z
    .string()
    .optional()
    .default("https://auth.ebay.com/oauth2/authorize"),
  EBAY_PROD_RU_NAME: z.string().optional().default(""),
  WHATNOT_API_KEY: z.string().optional().default(""),
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  SENTRY_DSN: z.string().optional().default(""),
  SPORTRADAR_API_KEY: z.string().optional().default(""),
  GOOGLE_GEN_AI_KEY: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  APPLE_AUDIENCE: z.string().optional().default(""),
  APPLE_ISSUER: z.string().optional().default("https://appleid.apple.com"),
  AWS_ACCESS_KEY_ID: z.string().optional().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(""),
  AWS_REGION: z.string().optional().default("us-east-1"),
  S3_BUCKET_NAME: z.string().optional().default(""),
  SOLD_COMPS_KEY: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function validateEnv(
  overrides: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): Env {
  const parsed = envSchema.safeParse(overrides);
  if (!parsed.success) {
    const msg = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`Environment validation failed: ${msg}`);
  }
  cached = parsed.data;
  return parsed.data;
}

export function getEnv(): Env {
  if (!cached) {
    return validateEnv();
  }
  return cached;
}
