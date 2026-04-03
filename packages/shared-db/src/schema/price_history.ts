import { numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { cards } from "./cards.js";

export const priceHistory = pgTable("price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  avgPrice: numeric("avg_price", { precision: 14, scale: 2 }).notNull(),
  lastSale: numeric("last_sale", { precision: 14, scale: 2 }),
  high90d: numeric("high_90d", { precision: 14, scale: 2 }),
  low90d: numeric("low_90d", { precision: 14, scale: 2 }),
  source: varchar("source", { length: 64 }).notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});
