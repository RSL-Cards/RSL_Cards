import { jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  sportPreference: varchar("sport_preference", { length: 128 }),
  businessName: varchar("business_name", { length: 255 }),
  taxId: varchar("tax_id", { length: 64 }),
  paymentMethods: jsonb("payment_methods").$type<Record<string, unknown>>(),
  connectedPlatforms: jsonb("connected_platforms").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
