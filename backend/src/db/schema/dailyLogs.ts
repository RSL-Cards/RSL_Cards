import { index as drizzleIndex, pgTable, uuid, varchar, decimal, timestamp, pgEnum, pgMaterializedView } from 'drizzle-orm/pg-core'
import { users } from './auth'


export const dailyLogStatusEnum = pgEnum('daily_log_status', ['open', 'closed'])

export const dailyLogs = pgTable('daily_logs', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').references(() => users.id).notNull(),
  name:         varchar('name', { length: 255 }).notNull(),
  status:       dailyLogStatusEnum('status').default('open').notNull(),
  startingCash: decimal('starting_cash', { precision: 10, scale: 2 }).default('0'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  closedAt:     timestamp('closed_at', { withTimezone: true }),
}, (t) => ({
  dailyLogUserIdIdx: drizzleIndex('idx_daily_logs_user_id').on(t.userId),
  dailyLogStatusIdx: drizzleIndex('idx_daily_logs_status').on(t.status),
}))
