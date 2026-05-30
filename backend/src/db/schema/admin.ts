import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const featureFlags = pgTable('feature_flags', {
  id:          uuid('id').primaryKey().defaultRandom(),
  key:         varchar('key', { length: 100 }).unique().notNull(), // aiNarratives, stripePayments
  value:       boolean('value').default(false),
  description: text('description'),
  updatedBy:   uuid('updated_by').references(() => users.id),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const dealerReviews = pgTable('dealer_reviews', {
  id:         uuid('id').primaryKey().defaultRandom(),
  dealerId:   uuid('dealer_id').references(() => users.id).notNull(),
  reviewerId: uuid('reviewer_id').references(() => users.id).notNull(),
  rating:     integer('rating').notNull(),  // 1-5
  comment:    text('comment'),
  isApproved: boolean('is_approved').default(false),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const auditLogs = pgTable('audit_logs', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').references(() => users.id),
  action:     varchar('action', { length: 255 }).notNull(),
  resource:   varchar('resource', { length: 100 }),
  resourceId: varchar('resource_id', { length: 255 }),
  ipAddress:  varchar('ip_address', { length: 50 }),
  userAgent:  text('user_agent'),
  metadata:   text('metadata'),  // JSON extra context
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
})
