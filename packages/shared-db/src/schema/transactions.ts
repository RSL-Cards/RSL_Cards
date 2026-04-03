import { numeric, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { inventory } from "./inventory.js";
import { users } from "./users.js";

export const transactionChannelEnum = pgEnum("transaction_channel", [
  "ebay",
  "whatnot",
  "mercari",
  "tcgplayer",
  "shopify",
  "in_person",
  "show",
  "online",
  "trade_show",
  "other",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card",
  "paypal",
  "venmo",
  "zelle",
  "crypto",
  "trade_credit",
  "other",
]);

export const dealRatingEnum = pgEnum("deal_rating", ["good_deal", "fair_price", "overpaying"]);

export const transactionTypeEnum = pgEnum("transaction_type", ["buy", "sell", "trade"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  inventoryId: uuid("inventory_id")
    .notNull()
    .references(() => inventory.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  channel: transactionChannelEnum("channel").notNull(),
  price: numeric("price", { precision: 14, scale: 2 }).notNull(),
  costBasis: numeric("cost_basis", { precision: 14, scale: 2 }).notNull(),
  profit: numeric("profit", { precision: 14, scale: 2 }).notNull().default("0"),
  platformFee: numeric("platform_fee", { precision: 14, scale: 2 }).notNull().default("0"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  dealRating: dealRatingEnum("deal_rating").notNull().default("fair_price"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
