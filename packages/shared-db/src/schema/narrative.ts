import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'

export const narrativeTypeEnum   = pgEnum('narrative_type',
  ['breakout','injury','hype','decline','seasonal','trade','hof','award','auction_record'])
export const narrativeStatusEnum = pgEnum('narrative_status',
  ['pending_review','approved','published','rejected'])
export const watchlistTierEnum   = pgEnum('watchlist_tier', ['core','subscribed','on_demand'])

export const narratives = pgTable('narratives', {
  id:               uuid('id').primaryKey().defaultRandom(),
  playerName:       varchar('player_name', { length: 255 }).notNull(),
  sport:            varchar('sport', { length: 50 }),
  cardIds:          text('card_ids').array(),           // affected card IDs
  headline:         varchar('headline', { length: 500 }).notNull(),
  shortSummary:     varchar('short_summary', { length: 280 }), // one-line for BUY screen
  body:             text('body').notNull(),
  whyItMatters:     text('why_it_matters'),             // dealer-specific insight
  narrativeType:    narrativeTypeEnum('narrative_type').notNull(),
  priceChangePct:   decimal('price_change_pct', { precision: 5, scale: 2 }),
  priceDirection:   varchar('price_direction', { length: 5 }),  // up | down
  correlatedEvents: text('correlated_events'),          // JSON: [{event, score}]
  status:           narrativeStatusEnum('status').default('pending_review'),
  reviewedBy:       uuid('reviewed_by'),
  publishedAt:      timestamp('published_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// NEW TABLE 1: 3-tier player monitoring list
export const playerWatchlist = pgTable('player_watchlist', {
  id:            uuid('id').primaryKey().defaultRandom(),
  playerName:    varchar('player_name', { length: 255 }).notNull().unique(),
  sport:         varchar('sport', { length: 50 }).notNull(),
  tier:          watchlistTierEnum('tier').notNull(),       // core | subscribed | on_demand
  holderCount:   integer('holder_count').default(0),        // users holding this player's cards
  active:        boolean('active').default(true),           // false when holderCount = 0
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// NEW TABLE 2: Current snapshot per player — UPSERTED every 2-hour cycle
// This IS the memory. Next cycle loads this to know what changed.
export const playerSnapshots = pgTable('player_snapshots', {
  id:                uuid('id').primaryKey().defaultRandom(),
  playerName:        varchar('player_name', { length: 255 }).notNull().unique(),
  sport:             varchar('sport', { length: 50 }),
  // CardPulse 6-factor scores (0-100 each)
  performanceScore:  decimal('performance_score', { precision: 5, scale: 2 }),
  sentimentScore:    decimal('sentiment_score', { precision: 5, scale: 2 }),
  eventScore:        decimal('event_score', { precision: 5, scale: 2 }),
  momentumScore:     decimal('momentum_score', { precision: 5, scale: 2 }),
  liquidityScore:    decimal('liquidity_score', { precision: 5, scale: 2 }),
  volatilityScore:   decimal('volatility_score', { precision: 5, scale: 2 }),
  totalScore:        decimal('total_score', { precision: 5, scale: 2 }),
  // Raw API data — carry-forward on API failure
  rawPerformance:    text('raw_performance'),  // JSON: Sportradar response
  rawSentiment:      text('raw_sentiment'),    // JSON: Twitter + Reddit
  rawEvents:         text('raw_events'),       // JSON: NewsAPI articles
  rawComps:          text('raw_comps'),        // JSON: eBay comps
  // KEY FIELD: used as fromTime filter in next cycle API calls
  lastFetchedAt:     timestamp('last_fetched_at', { withTimezone: true }),
  narrativeGenerated:boolean('narrative_generated').default(false),
  updatedAt:         timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// NEW TABLE 3: Append-only history — never updated/deleted
export const playerSnapshotHistory = pgTable('player_snapshot_history', {
  id:               uuid('id').primaryKey().defaultRandom(),
  playerName:       varchar('player_name', { length: 255 }).notNull(),
  sport:            varchar('sport', { length: 50 }),
  totalScore:       decimal('total_score', { precision: 5, scale: 2 }),
  performanceScore: decimal('performance_score', { precision: 5, scale: 2 }),
  sentimentScore:   decimal('sentiment_score', { precision: 5, scale: 2 }),
  eventScore:       decimal('event_score', { precision: 5, scale: 2 }),
  momentumScore:    decimal('momentum_score', { precision: 5, scale: 2 }),
  liquidityScore:   decimal('liquidity_score', { precision: 5, scale: 2 }),
  volatilityScore:  decimal('volatility_score', { precision: 5, scale: 2 }),
  fetchedFrom:      timestamp('fetched_from', { withTimezone: true }), // window start
  fetchedTo:        timestamp('fetched_to', { withTimezone: true }),   // window end
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
  eventType:    varchar('event_type', { length: 100 }),  // nfl_draft|topps_chrome|nba_finals
  sport:        varchar('sport', { length: 50 }),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  notes:        text('notes'),
  isActive:     boolean('is_active').default(true),
})
