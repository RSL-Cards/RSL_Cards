// shared/db/schema/transaction.ts
import { pgTable, uuid, varchar, decimal, integer, boolean, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { inventory } from './inventory'
import { customers } from './user'

export const txTypeEnum = pgEnum('tx_type', ['buy', 'sell', 'trade'])
export const txChannelEnum = pgEnum('tx_channel', [
  'card_show', 'ebay', 'whatnot', 'mercari', 'tcgplayer',
  'facebook', 'shopify', 'comc', 'goldin', 'myslabs', 'instagram', 'other'
])
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash', 'venmo', 'zelle', 'paypal', 'cashapp', 'trade', 'other'
])
export const dealRatingEnum = pgEnum('deal_rating', ['good_deal', 'fair_price', 'overpaying'])

export const transactions = pgTable('transactions', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  userId:             uuid('user_id').references(() => users.id).notNull(),
  inventoryId:        uuid('inventory_id').references(() => inventory.id),
  customerId:         uuid('customer_id').references(() => customers.id),
  type:               txTypeEnum('type').notNull(),
  channel:            txChannelEnum('channel').default('card_show'),
  price:              decimal('price', { precision: 10, scale: 2 }).notNull(),
  costBasis:          decimal('cost_basis', { precision: 10, scale: 2 }),
  profit:             decimal('profit', { precision: 10, scale: 2 }),
  profitPct:          decimal('profit_pct', { precision: 8, scale: 2 }),
  platformFee:        decimal('platform_fee', { precision: 10, scale: 2 }),
  netToDealer:        decimal('net_to_dealer', { precision: 10, scale: 2 }),
  paymentMethod:      paymentMethodEnum('payment_method'),
  dealRating:         dealRatingEnum('deal_rating'),
  compPriceAtTime:    decimal('comp_price_at_time', { precision: 10, scale: 2 }),
  playerName:         varchar('player_name', { length: 255 }),     // denormalized for reports
  cardSnapshot:       text('card_snapshot'),                        // JSON snapshot of card at time of sale
  isOffline:          boolean('is_offline').default(false),          // was device offline?
  localId:            varchar('local_id', { length: 255 }),          // mobile SQLite id for dedup on sync
  createdAt:          timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const tradeItems = pgTable('trade_items', {
  id:             uuid('id').primaryKey().defaultRandom(),
  transactionId:  uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  direction:      varchar('direction', { length: 10 }).notNull(),  // given | received
  inventoryId:    uuid('inventory_id').references(() => inventory.id),
  playerName:     varchar('player_name', { length: 255 }),
  marketValue:    decimal('market_value', { precision: 10, scale: 2 }),
  cashAdjustment: decimal('cash_adjustment', { precision: 10, scale: 2 }).default('0'),
})

export const offlineSyncQueue = pgTable('offline_sync_queue', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').references(() => users.id).notNull(),
  localId:    varchar('local_id', { length: 255 }).notNull(),
  type:       txTypeEnum('type').notNull(),
  payload:    text('payload').notNull(),                           // JSON stringified
  synced:     boolean('synced').default(false),
  syncedAt:   timestamp('synced_at', { withTimezone: true }),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
})
