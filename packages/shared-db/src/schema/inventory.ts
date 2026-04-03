import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql, type SQL } from "drizzle-orm";
import { cards } from "./cards.js";
import { users } from "./users.js";

export const listingStatusEnum = pgEnum("inventory_listing_status", [
  "draft",
  "listed",
  "sold",
  "ended",
  "pending",
]);

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "set null" }),
  playerName: varchar("player_name", { length: 255 }).notNull(),
  year: integer("year").notNull(),
  setName: varchar("set_name", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 64 }),
  costBasis: numeric("cost_basis", { precision: 14, scale: 2 }).notNull(),
  currentMarketValue: numeric("current_market_value", { precision: 14, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  isConsignment: boolean("is_consignment").notNull().default(false),
  listingStatus: listingStatusEnum("listing_status").notNull().default("draft"),
  listedPlatforms: text("listed_platforms").array().notNull().default(sql`ARRAY[]::text[]`),
  photos: text("photos").array().notNull().default(sql`ARRAY[]::text[]`),
  sport: varchar("sport", { length: 64 }).notNull(),
  notes: text("notes"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  daysHeld: integer("days_held")
    .notNull()
    .generatedAlwaysAs(
      (): SQL =>
        sql`GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (timezone('utc', now()) - timezone('utc', ${inventory.addedAt}))) / 86400)::int)`,
    ),
});
