import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerName: varchar("player_name", { length: 255 }).notNull(),
  year: integer("year").notNull(),
  setName: varchar("set_name", { length: 255 }).notNull(),
  cardNumber: varchar("card_number", { length: 64 }).notNull(),
  variation: varchar("variation", { length: 255 }),
  sport: varchar("sport", { length: 64 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 128 }),
  isRookie: boolean("is_rookie").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
