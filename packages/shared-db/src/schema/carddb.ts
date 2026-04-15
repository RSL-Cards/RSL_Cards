import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  uniqueIndex,
  real,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { listingPlatformEnum } from "./listing";

// Core card catalog — populated from Ximilar + TCDB
export const cards = pgTable("cards", {
  id: varchar("id", { length: 255 }).primaryKey(), // ximilar_id or tcdb_id
  playerName: varchar("player_name", { length: 255 }).notNull(),
  year: integer("year"),
  setName: varchar("set_name", { length: 255 }),
  variation: varchar("variation", { length: 255 }),
  cardNumber: varchar("card_number", { length: 50 }),
  sport: varchar("sport", { length: 50 }),
  manufacturer: varchar("manufacturer", { length: 100 }), // Topps, Panini, Upper Deck
  isRookie: boolean("is_rookie").default(false),
  isAutograph: boolean("is_autograph").default(false),
  isRelic: boolean("is_relic").default(false),
  printRun: integer("print_run"),
  stockImageUrl: varchar("stock_image_url", { length: 500 }),
  source: varchar("source", { length: 50 }), // ximilar | tcdb | manual
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// FIX 1: ALL platforms, not just eBay. gradeKey added. contentHash for dedup.
export const platformSoldListings = pgTable("platform_sold_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: varchar("card_id", { length: 255 })
    .references(() => cards.id)
    .notNull(),
  gradeKey: varchar("grade_key", { length: 30 }).notNull(), // PSA_10 | BGS_9.5 | RAW
  platform: listingPlatformEnum("platform").notNull(), // ebay | whatnot | mercari | comc
  soldPrice: decimal("sold_price", { precision: 10, scale: 2 }).notNull(),
  platformItemId: varchar("platform_item_id", { length: 255 }), // eBay itemId, Whatnot listingId
  soldAt: timestamp("sold_at", { withTimezone: true }).notNull(),
  title: varchar("title", { length: 500 }),
  condition: varchar("condition", { length: 100 }),
  contentHash: varchar("content_hash", { length: 64 }).unique(), // MD5(platform+itemId+soldAt)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// FIX 2: cardCompSnapshots replaces platformPriceComps from listing service.
// One row per card+gradeKey+platform. UPSERTED every 15min cache cycle.
// This drives the BUY screen cross-platform comparison.
export const cardCompSnapshots = pgTable(
  "card_comp_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: varchar("card_id", { length: 255 })
      .references(() => cards.id)
      .notNull(),
    gradeKey: varchar("grade_key", { length: 30 }).notNull(), // CRITICAL: PSA_10 | BGS_9.5 | RAW
    platform: listingPlatformEnum("platform").notNull(),
    avgSoldPrice: decimal("avg_sold_price", { precision: 10, scale: 2 }),
    lastSoldPrice: decimal("last_sold_price", { precision: 10, scale: 2 }),
    lowestActive: decimal("lowest_active", { precision: 10, scale: 2 }), // lowest current listing
    salesCount30d: integer("sales_count_30d").default(0),
    priceTrend30d: decimal("price_trend_30d", { precision: 8, scale: 2 }), // % vs 30 days ago
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqCompSnapshot: uniqueIndex("uq_comp_card_grade_platform").on(
      t.cardId,
      t.gradeKey,
      t.platform,
    ),
  }),
);

// 30/90/365 day price history per card+grade (for sparkline charts)
export const cardPriceHistory = pgTable("card_price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: varchar("card_id", { length: 255 })
    .references(() => cards.id)
    .notNull(),
  gradeKey: varchar("grade_key", { length: 30 }).notNull(),
  avgSoldPrice: decimal("avg_sold_price", { precision: 10, scale: 2 }),
  minSoldPrice: decimal("min_sold_price", { precision: 10, scale: 2 }),
  maxSoldPrice: decimal("max_sold_price", { precision: 10, scale: 2 }),
  salesCount: integer("sales_count"),
  priceTrend: decimal("price_trend", { precision: 8, scale: 2 }),
  recordedDate: timestamp("recorded_date", { withTimezone: true }).defaultNow(),
});

// Consumer price alerts
export const priceAlerts = pgTable("price_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  cardId: varchar("card_id", { length: 255 })
    .references(() => cards.id)
    .notNull(),
  gradeKey: varchar("grade_key", { length: 30 }).notNull(), // MUST have grade on alert
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  direction: varchar("direction", { length: 10 }).default("below"), // below | above
  isTriggered: boolean("is_triggered").default(false),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Consumer want list
export const wantList = pgTable("want_list", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  cardId: varchar("card_id", { length: 255 })
    .references(() => cards.id)
    .notNull(),
  gradeKey: varchar("grade_key", { length: 30 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Consumer collection
export const consumerCollection = pgTable("consumer_collection", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  cardId: varchar("card_id", { length: 255 })
    .references(() => cards.id)
    .notNull(),
  gradeKey: varchar("grade_key", { length: 30 }).notNull(),
  costBasis: decimal("cost_basis", { precision: 10, scale: 2 }),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(1),
  acquiredAt: timestamp("acquired_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Image hashes for card scan caching - prevents re-scanning same images
export const imageHashes = pgTable(
  "image_hashes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    imageHash: varchar("image_hash", { length: 64 }).notNull().unique(), // SHA-256 hash of image
    cardId: varchar("card_id", { length: 255 })
      .references(() => cards.id)
      .notNull(),
    confidence: real("confidence").notNull(), // AI confidence score (0-1)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    // Index for fast lookups by image hash
    imageHashIdx: uniqueIndex("uq_image_hash").on(t.imageHash),
  }),
);
