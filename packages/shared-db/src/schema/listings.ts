import { numeric, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { inventory } from "./inventory.js";
import { users } from "./users.js";

export const listingRowStatusEnum = pgEnum("listing_row_status", [
  "active",
  "sold",
  "ended",
  "pending",
]);

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  inventoryId: uuid("inventory_id")
    .notNull()
    .references(() => inventory.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 64 }).notNull(),
  platformListingId: varchar("platform_listing_id", { length: 255 }).notNull(),
  status: listingRowStatusEnum("status").notNull().default("pending"),
  listPrice: numeric("list_price", { precision: 14, scale: 2 }).notNull(),
  platformFeePct: numeric("platform_fee_pct", { precision: 6, scale: 4 }).notNull(),
  netToDealer: numeric("net_to_dealer", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
