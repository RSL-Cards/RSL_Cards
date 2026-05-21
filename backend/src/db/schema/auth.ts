import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["dealer", "consumer", "admin"]);
export const oauthProviderEnum = pgEnum("oauth_provider", ["google", "apple"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }), // null = OAuth only
  role: roleEnum("role").default("consumer").notNull(),
  oauthProvider: oauthProviderEnum("oauth_provider"),
  oauthId: varchar("oauth_id", { length: 255 }),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }), // AES-256-GCM encrypted
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  isEmailVerified: boolean("is_email_verified").default(false),
  isActive: boolean("is_active").default(true),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpiry: timestamp("password_reset_expiry", {
    withTimezone: true,
  }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  deviceInfo: varchar("device_info", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  fcmToken: varchar("fcm_token", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 10 }).notNull(), // ios | android
  deviceId: varchar("device_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
