import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const narrativeTypeEnum = pgEnum("narrative_type", [
  "market_move",
  "player_spotlight",
  "portfolio",
  "tax",
  "general",
]);

export const narratives = pgTable("narratives", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  narrativeType: narrativeTypeEnum("narrative_type").notNull(),
  headline: varchar("headline", { length: 512 }).notNull(),
  body: text("body").notNull(),
  sourceEvent: text("source_event"),
  metadata: text("metadata"),
  reviewedByAdmin: uuid("reviewed_by_admin").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
