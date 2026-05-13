import { pgTable, uuid, varchar, text, boolean, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const dealerProfiles = pgTable('dealer_profiles', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  displayName:      varchar('display_name', { length: 255 }).notNull(),
  bio:              text('bio'),
  phone:            varchar('phone', { length: 20 }),
  photoUrl:         varchar('photo_url', { length: 500 }),
  sports:           text('sports').array(),         // ['football','baseball']
  sellChannels:     text('sell_channels').array(),  // ['card_shows','ebay']
  customUrl:        varchar('custom_url', { length: 100 }).unique(), // rslcards.com/dealers/name
  isPublic:         boolean('is_public').default(true),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('free'),
  rating:           varchar('rating', { length: 5 }).default('0'),   // avg dealer rating
  reviewCount:      integer('review_count').default(0),
  followerCount:    integer('follower_count').default(0),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const consumerProfiles = pgTable('consumer_profiles', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  photoUrl:    varchar('photo_url', { length: 500 }),
  sports:      text('sports').array(),
  teams:       text('teams').array(),
  players:     text('players').array(),
  isPremium:   boolean('is_premium').default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const paymentMethods = pgTable('payment_methods', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type:        varchar('type', { length: 20 }).notNull(), // venmo|zelle|paypal|cashapp|other
  handle:      varchar('handle', { length: 255 }).notNull(),
  isDefault:   boolean('is_default').default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const platformConnections = pgTable('platform_connections', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  platform:        varchar('platform', { length: 50 }).notNull(), // ebay|whatnot|mercari|tcgplayer
  accessToken:     text('access_token'),           // encrypted at rest
  refreshToken:    text('refresh_token'),          // encrypted at rest
  tokenExpiresAt:  timestamp('token_expires_at', { withTimezone: true }),
  platformUserId:  varchar('platform_user_id', { length: 255 }),
  isActive:        boolean('is_active').default(true),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  userPlatformUnique: uniqueIndex('uq_user_platform').on(t.userId, t.platform)
}))

export const userPreferences = pgTable('user_preferences', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  saleAlerts:       boolean('sale_alerts').default(true),
  priceAlerts:      boolean('price_alerts').default(true),
  aiNarratives:     boolean('ai_narratives').default(true),
  agingAlerts:      boolean('aging_alerts').default(true),
  showReminders:    boolean('show_reminders').default(true),
  wantListMatches:  boolean('want_list_matches').default(true),
  weeklyDigest:     boolean('weekly_digest').default(true),
  quietHoursStart:  varchar('quiet_hours_start', { length: 5 }).default('22:00'),
  quietHoursEnd:    varchar('quiet_hours_end', { length: 5 }).default('08:00'),
  timezone:         varchar('timezone', { length: 50 }).default('America/New_York'),
  dailyLimit:       integer('daily_limit').default(20),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const dealerFollowers = pgTable('dealer_followers', {
  id:         uuid('id').primaryKey().defaultRandom(),
  dealerId:   uuid('dealer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  followerId: uuid('follower_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const customers = pgTable('customers', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), // dealer
  name:             varchar('name', { length: 255 }).notNull(),
  phone:            varchar('phone', { length: 20 }),
  email:            varchar('email', { length: 255 }),
  notes:            text('notes'),
  isFavorite:       boolean('is_favorite').default(false),
  totalTransactions:integer('total_transactions').default(0),
  totalSpent:       varchar('total_spent', { length: 20 }).default('0'), // decimal as string
  lastSeenAt:       timestamp('last_seen_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
})
