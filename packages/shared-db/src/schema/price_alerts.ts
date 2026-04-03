import { boolean, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { cards } from "./cards.js";
import { users } from "./users.js";

export const priceAlerts = pgTable("price_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  targetPrice: numeric("target_price", { precision: 14, scale: 2 }).notNull(),
  direction: varchar("direction", { length: 16 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
