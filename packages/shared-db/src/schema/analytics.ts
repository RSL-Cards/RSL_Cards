import { pgTable, uuid, varchar, decimal, integer, timestamp, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './auth'

// Pre-aggregated daily summaries — built by analytics-snapshot BullMQ job at 2am
export const dailySummaries = pgTable('daily_summaries', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date:             varchar('date', { length: 10 }).notNull(),  // YYYY-MM-DD
  cardsBought:      integer('cards_bought').default(0),
  cardsSold:        integer('cards_sold').default(0),
  totalSpent:       decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
  totalRevenue:     decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  netProfit:        decimal('net_profit', { precision: 10, scale: 2 }).default('0'),
  bestDealMargin:   decimal('best_deal_margin', { precision: 8, scale: 2 }),
  revenueByChannel: text('revenue_by_channel'),  // JSON {ebay:200, card_show:150}
  revenueByPayment: text('revenue_by_payment'),  // JSON {cash:100, venmo:200}
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqUserDate: uniqueIndex('uq_daily_summary_user_date').on(t.userId, t.date),
}))

export const taxRecords = pgTable('tax_records', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').references(() => users.id).notNull(),
  taxYear:          integer('tax_year').notNull(),
  totalRevenue:     decimal('total_revenue', { precision: 12, scale: 2 }),
  totalCostBasis:   decimal('total_cost_basis', { precision: 12, scale: 2 }),
  grossProfit:      decimal('gross_profit', { precision: 12, scale: 2 }),
  shortTermGains:   decimal('short_term_gains', { precision: 12, scale: 2 }),
  longTermGains:    decimal('long_term_gains', { precision: 12, scale: 2 }),
  platformFeesPaid: decimal('platform_fees_paid', { precision: 12, scale: 2 }),
  totalExpenses:    decimal('total_expenses', { precision: 12, scale: 2 }),
  reportS3Url:      varchar('report_s3_url', { length: 500 }),
  generatedAt:      timestamp('generated_at', { withTimezone: true }).defaultNow(),
})

export const expenses = pgTable('expenses', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id).notNull(),
  category:    varchar('category', { length: 100 }),  // show_fee|travel|supplies|shipping
  description: varchar('description', { length: 255 }),
  amount:      decimal('amount', { precision: 10, scale: 2 }).notNull(),
  receiptUrl:  varchar('receipt_url', { length: 500 }),
  expenseDate: timestamp('expense_date', { withTimezone: true }).notNull(),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})
