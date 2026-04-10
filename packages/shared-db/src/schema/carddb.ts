// shared/db/schema/carddb.ts
import { pgTable, uuid, varchar, decimal, integer, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const cards = pgTable('cards', {
  id:             varchar('id', { length: 255 }).primaryKey(),    // ximilar_id or tcdb_id
  playerName:     varchar('player_name', { length: 255 }).notNull(),
  year:           integer('year'),
  setName:        varchar('set_name', { length: 255 }),
  variation:      varchar('variation', { length: 255 }),
  cardNumber:     varchar('card_number', { length: 50 }),
  sport:          varchar('sport', { length: 50 }),
  manufacturer:   varchar('manufacturer', { length: 100 }),       // Topps, Panini, Upper Deck
  isRookie:       boolean('is_rookie').default(false),
  isAutograph:    boolean('is_autograph').default(false),
  isRelic:        boolean('is_relic').default(false),
  printRun:       integer('print_run'),
  stockImageUrl:  varchar('stock_image_url', { length: 500 }),
  source:         varchar('source', { length: 50 }),              // ximilar | tcdb | manual
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const cardPriceHistory = pgTable('card_price_history', {
  id:           uuid('id').primaryKey().defaultRandom(),
  cardId:       varchar('card_id', { length: 255 }).references(() => cards.id).notNull(),
  gradeKey:     varchar('grade_key', { length: 30 }),             // 'RAW' | 'PSA_10' | 'BGS_9.5'
  avgSoldPrice: decimal('avg_sold_price', { precision: 10, scale: 2 }),
  minSoldPrice: decimal('min_sold_price', { precision: 10, scale: 2 }),
  maxSoldPrice: decimal('max_sold_price', { precision: 10, scale: 2 }),
  salesCount:   integer('sales_count'),
  priceTrend:   decimal('price_trend', { precision: 8, scale: 2 }), // % change vs 30 days ago
  recordedDate: timestamp('recorded_date', { withTimezone: true }).defaultNow(),
})

export const ebayRecentSales = pgTable('ebay_recent_sales', {
  id:           uuid('id').primaryKey().defaultRandom(),
  cardId:       varchar('card_id', { length: 255 }).references(() => cards.id).notNull(),
  gradeKey:     varchar('grade_key', { length: 30 }),
  soldPrice:    decimal('sold_price', { precision: 10, scale: 2 }).notNull(),
  ebayItemId:   varchar('ebay_item_id', { length: 255 }),
  soldAt:       timestamp('sold_at', { withTimezone: true }).notNull(),
  title:        varchar('title', { length: 500 }),
})

export const priceAlerts = pgTable('price_alerts', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cardId:         varchar('card_id', { length: 255 }).references(() => cards.id).notNull(),
  gradeKey:       varchar('grade_key', { length: 30 }),
  targetPrice:    decimal('target_price', { precision: 10, scale: 2 }).notNull(),
  direction:      varchar('direction', { length: 10 }).default('below'), // below | above
  isTriggered:    boolean('is_triggered').default(false),
  triggeredAt:    timestamp('triggered_at', { withTimezone: true }),
  isActive:       boolean('is_active').default(true),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const wantList = pgTable('want_list', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cardId:       varchar('card_id', { length: 255 }).references(() => cards.id).notNull(),
  gradeKey:     varchar('grade_key', { length: 30 }),
  maxPrice:     decimal('max_price', { precision: 10, scale: 2 }),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
})
