// shared/db/schema/user.ts
import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const dealerProfiles = pgTable('dealer_profiles', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  displayName:      varchar('display_name', { length: 255 }).notNull(),
  bio:              text('bio'),
  phone:            varchar('phone', { length: 20 }),
  photoUrl:         varchar('photo_url', { length: 500 }),
  sports:           text('sports').array(),           // ['basketball','football',...]
  sellChannels:     text('sell_channels').array(),    // ['card_shows','ebay',...]
  customUrl:        varchar('custom_url', { length: 100 }).unique(), // rslcards.com/dealers/yourname
  isPublic:         boolean('is_public').default(true),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('free'),
  subscriptionExpiry: timestamp('subscription_expiry', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const consumerProfiles = pgTable('consumer_profiles', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  displayName:  varchar('display_name', { length: 255 }).notNull(),
  photoUrl:     varchar('photo_url', { length: 500 }),
  sports:       text('sports').array(),
  teams:        text('teams').array(),
  players:      text('players').array(),
  isPremium:    boolean('is_premium').default(false),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const paymentMethods = pgTable('payment_methods', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider:       varchar('provider', { length: 50 }).notNull(), // venmo|zelle|paypal|cashapp
  handle:         varchar('handle', { length: 255 }).notNull(),   // username/email/phone
  isDefault:      boolean('is_default').default(false),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const connectedPlatforms = pgTable('connected_platforms', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  platform:       varchar('platform', { length: 50 }).notNull(), // ebay|whatnot|mercari|tcgplayer|shopify|comc
  accessToken:    text('access_token'),                          // encrypted
  refreshToken:   text('refresh_token'),                         // encrypted
  tokenExpiry:    timestamp('token_expiry', { withTimezone: true }),
  platformUserId: varchar('platform_user_id', { length: 255 }),
  platformUsername: varchar('platform_username', { length: 255 }),
  isActive:       boolean('is_active').default(true),
  connectedAt:    timestamp('connected_at', { withTimezone: true }).defaultNow(),
})

export const notificationPreferences = pgTable('notification_preferences', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  userId:               uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  pushEnabled:          boolean('push_enabled').default(true),
  emailEnabled:         boolean('email_enabled').default(true),
  saleNotifications:    boolean('sale_notifications').default(true),
  priceAlerts:          boolean('price_alerts').default(true),
  aiNarratives:         boolean('ai_narratives').default(true),
  showReminders:        boolean('show_reminders').default(true),
  agingAlerts:          boolean('aging_alerts').default(true),
  offerReceived:        boolean('offer_received').default(true),
  inventoryTrending:    boolean('inventory_trending').default(true),
  weeklyDigest:         boolean('weekly_digest').default(true),
  quietHoursStart:      varchar('quiet_hours_start', { length: 5 }),  // '22:00'
  quietHoursEnd:        varchar('quiet_hours_end', { length: 5 }),    // '08:00'
  minPriceMovePct:      varchar('min_price_move_pct', { length: 5 }).default('10'),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const customers = pgTable('customers', {
  id:           uuid('id').primaryKey().defaultRandom(),
  dealerId:     uuid('dealer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name:         varchar('name', { length: 255 }).notNull(),
  phone:        varchar('phone', { length: 20 }),
  email:        varchar('email', { length: 255 }),
  notes:        text('notes'),
  isStarred:    boolean('is_starred').default(false),
  totalRevenue: varchar('total_revenue', { length: 20 }).default('0'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
