import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  real,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { listingPlatformEnum } from "./listing";

// ─────────────────────────────────────────────────────────────
// 1. PLAYERS — one row per real-world athlete
// ─────────────────────────────────────────────────────────────
export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    sport: varchar("sport", { length: 50 }).notNull(), // basketball | baseball | football | etc.
    team: varchar("team", { length: 100 }),
    position: varchar("position", { length: 50 }),
    rookieYear: integer("rookie_year"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    playerNameIdx: index("idx_players_name").on(t.name),
  }),
);

// ─────────────────────────────────────────────────────────────
// 2. CARDS — base card identity only (no variant/parallel fields)
//    Example: Kon Knueppel – 2025 Topps Chrome #254
// ─────────────────────────────────────────────────────────────
export const cards = pgTable(
  "cards",
  {
    id: varchar("id", { length: 255 }).primaryKey(), // ximilar_id or tcdb_id
    playerId: uuid("player_id")
      .references(() => players.id)
      .notNull(),
    year: integer("year"),
    setName: varchar("set_name", { length: 255 }),
    cardNumber: varchar("card_number", { length: 50 }),
    manufacturer: varchar("manufacturer", { length: 100 }), // Topps | Panini | Upper Deck
    isRookie: boolean("is_rookie").default(false),
    source: varchar("source", { length: 50 }), // ximilar | tcdb | manual
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    cardPlayerIdx: index("idx_cards_player_id").on(t.playerId),
    cardYearIdx: index("idx_cards_year").on(t.year),
    cardSetNameIdx: index("idx_cards_set_name").on(t.setName),
    cardNumberIdx: index("idx_cards_card_number").on(t.cardNumber),
    uniqCard: uniqueIndex("uq_card_player_year_set_number").on(
      t.playerId,
      t.year,
      t.setName,
      t.cardNumber,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────
// 3. CARD VARIANTS — versions of a base card
//    Examples: Base | Refractor | Gold /50 | Auto | Patch
// ─────────────────────────────────────────────────────────────
export const cardVariants = pgTable(
  "card_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: varchar("card_id", { length: 255 })
      .references(() => cards.id)
      .notNull(),
    year: integer("year"), // e.g. 2007, 2021
    setName: varchar("set_name", { length: 255 }), // e.g. Topps Chrome, Prizm
    name: varchar("name", { length: 100 }).notNull(), // Base | Refractor | Gold | Auto | Patch
    isParallel: boolean("is_parallel").default(false),
    isBase: boolean("is_base").default(false),
    isAutograph: boolean("is_autograph").default(false),
    isRelic: boolean("is_relic").default(false), // Includes memorabilia
    printRun: integer("print_run"), // nullable; e.g. 50, 10, 1
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    variantCardIdx: index("idx_card_variants_card_id").on(t.cardId),
    uniqVariant: uniqueIndex("uq_variant_card_details").on(
      t.cardId,
      t.year,
      t.setName,
      t.name,
      t.printRun,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────
// 4. CARD PRICES — market prices per variant per grade
// ─────────────────────────────────────────────────────────────
export const cardPrices = pgTable(
  "card_prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .references(() => cardVariants.id)
      .notNull(),
    grade: varchar("grade", { length: 30 }).notNull(), // PSA 10 | PSA 9 | Raw | BGS 9.5
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),
    source: varchar("source", { length: 50 }).notNull(), // ebay | comc | manual
    salesCount: integer("sales_count"),
    lastSoldAt: timestamp("last_sold_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    priceVariantGradeIdx: index("idx_card_prices_variant_grade").on(
      t.variantId,
      t.grade,
    ),
    priceVariantIdx: index("idx_card_prices_variant_id").on(t.variantId),
  }),
);

// ─────────────────────────────────────────────────────────────
// Sales & market data tables
// (reference variantId — price/grade is a variant-level concept)
// ─────────────────────────────────────────────────────────────

// ALL platforms sold listings. gradeKey added. contentHash for dedup.
export const platformSoldListings = pgTable("platform_sold_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .references(() => cardVariants.id)
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

// One row per variant+gradeKey+platform. UPSERTED every 15min cache cycle.
// Drives the BUY screen cross-platform comparison.
export const cardCompSnapshots = pgTable(
  "card_comp_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .references(() => cardVariants.id)
      .notNull(),
    gradeKey: varchar("grade_key", { length: 30 }).notNull(), // PSA_10 | BGS_9.5 | RAW
    platform: listingPlatformEnum("platform").notNull(),
    avgSoldPrice: decimal("avg_sold_price", { precision: 10, scale: 2 }),
    lastSoldPrice: decimal("last_sold_price", { precision: 10, scale: 2 }),
    lowestActive: decimal("lowest_active", { precision: 10, scale: 2 }), // lowest current listing
    salesCount30d: integer("sales_count_30d").default(0),
    priceTrend30d: decimal("price_trend_30d", { precision: 8, scale: 2 }), // % vs 30 days ago
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqCompSnapshot: uniqueIndex("uq_comp_variant_grade_platform").on(
      t.variantId,
      t.gradeKey,
      t.platform,
    ),
  }),
);

// 30/90/365 day price history per variant+grade (for sparkline charts)
export const cardPriceHistory = pgTable("card_price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .references(() => cardVariants.id)
    .notNull(),
  gradeKey: varchar("grade_key", { length: 30 }).notNull(),
  avgSoldPrice: decimal("avg_sold_price", { precision: 10, scale: 2 }),
  minSoldPrice: decimal("min_sold_price", { precision: 10, scale: 2 }),
  maxSoldPrice: decimal("max_sold_price", { precision: 10, scale: 2 }),
  salesCount: integer("sales_count"),
  priceTrend: decimal("price_trend", { precision: 8, scale: 2 }),
  recordedDate: timestamp("recorded_date", { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────────────────────
// Consumer tables
// (reference cardId — user interests are at the base card level)
// ─────────────────────────────────────────────────────────────

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
    variantId: uuid("variant_id").references(() => cardVariants.id),
    confidence: real("confidence").notNull(), // AI confidence score (0-1)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    // Index for fast lookups by image hash
    imageHashIdx: uniqueIndex("uq_image_hash").on(t.imageHash),
  }),
);
