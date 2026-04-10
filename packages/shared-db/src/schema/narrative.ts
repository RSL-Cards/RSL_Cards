// shared/db/schema/narrative.ts
import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'

export const narrativeTypeEnum = pgEnum('narrative_type', [
  'breakout', 'injury', 'hype', 'decline', 'seasonal',
  'trade', 'hof', 'award', 'auction_record', 'anniversary'
])
export const narrativeStatusEnum = pgEnum('narrative_status', [
  'pending_review', 'approved', 'published', 'rejected'
])

export const narratives = pgTable('narratives', {
  id:               uuid('id').primaryKey().defaultRandom(),
  playerName:       varchar('player_name', { length: 255 }).notNull(),
  sport:            varchar('sport', { length: 50 }),
  cardIds:          text('card_ids').array(),
  headline:         varchar('headline', { length: 500 }).notNull(),
  shortSummary:     varchar('short_summary', { length: 280 }),     // one-line for BUY screen
  body:             text('body').notNull(),
  narrativeType:    narrativeTypeEnum('narrative_type').notNull(),
  priceChangePct:   decimal('price_change_pct', { precision: 5, scale: 2 }),
  priceDirection:   varchar('price_direction', { length: 5 }),      // up | down
  correlatedEvents: text('correlated_events'),                     // JSON: [{event, score}]
  status:           narrativeStatusEnum('status').default('pending_review'),
  reviewedBy:       uuid('reviewed_by'),
  publishedAt:      timestamp('published_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const priceAnomalies = pgTable('price_anomalies', {
  id:             uuid('id').primaryKey().defaultRandom(),
  cardId:         varchar('card_id', { length: 255 }).notNull(),
  playerName:     varchar('player_name', { length: 255 }),
  priceChangePct: decimal('price_change_pct', { precision: 5, scale: 2 }),
  windowHours:    integer('window_hours').default(48),
  narrativeId:    uuid('narrative_id').references(() => narratives.id),
  processed:      boolean('processed').default(false),
  detectedAt:     timestamp('detected_at', { withTimezone: true }).defaultNow(),
})

export const contentCalendar = pgTable('content_calendar', {
  id:           uuid('id').primaryKey().defaultRandom(),
  title:        varchar('title', { length: 255 }).notNull(),
  eventType:    varchar('event_type', { length: 100 }),             // nfl_draft | topps_chrome | nba_finals
  sport:        varchar('sport', { length: 50 }),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  notes:        text('notes'),
  isActive:     boolean('is_active').default(true),
})
