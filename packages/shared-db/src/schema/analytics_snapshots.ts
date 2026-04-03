import { integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(),
  revenue: varchar("revenue", { length: 32 }).notNull(),
  cogs: varchar("cogs", { length: 32 }).notNull(),
  grossProfit: varchar("gross_profit", { length: 32 }).notNull(),
  cardsBought: integer("cards_bought").notNull().default(0),
  cardsSold: integer("cards_sold").notNull().default(0),
  byChannel: jsonb("by_channel").$type<Record<string, unknown>>(),
  bySport: jsonb("by_sport").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
