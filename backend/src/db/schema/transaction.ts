import { index as drizzleIndex, pgTable, uuid, varchar, decimal, boolean, timestamp, text, pgEnum, pgMaterializedView } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { inventory } from './inventory'
import { customers } from './user'
import { dailyLogs } from './dailyLogs'


export const txTypeEnum      = pgEnum('tx_type', ['buy','sell','trade'])
export const txChannelEnum   = pgEnum('tx_channel', ['card_show','ebay','whatnot','mercari',
                                'tcgplayer','facebook','shopify','comc','goldin','app','myslabs','local_store','other'])
export const paymentMethodEnum = pgEnum('payment_method_type',
                                ['cash','venmo','zelle','paypal','cashapp','trade','other'])
export const dealRatingEnum  = pgEnum('deal_rating', ['good_deal','fair_price','overpaying'])

export const transactions = pgTable('transactions', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').references(() => users.id).notNull(),
  dailyLogId:      uuid('daily_log_id').references(() => dailyLogs.id),
  inventoryId:     uuid('inventory_id').references(() => inventory.id, { onDelete: 'set null' }),
  customerId:      uuid('customer_id').references(() => customers.id),
  type:            txTypeEnum('type').notNull(),
  channel:         txChannelEnum('channel').default('card_show'),
  price:           decimal('price', { precision: 10, scale: 2 }).notNull(),
  costBasis:       decimal('cost_basis', { precision: 10, scale: 2 }),
  profit:          decimal('profit', { precision: 10, scale: 2 }),
  profitPct:       decimal('profit_pct', { precision: 8, scale: 2 }),
  platformFee:     decimal('platform_fee', { precision: 10, scale: 2 }),
  netToDealer:     decimal('net_to_dealer', { precision: 10, scale: 2 }),
  paymentMethod:   paymentMethodEnum('payment_method'),
  dealRating:      dealRatingEnum('deal_rating'),
  compPriceAtTime: decimal('comp_price_at_time', { precision: 10, scale: 2 }), // snapshot
  playerName:      varchar('player_name', { length: 255 }),   // denormalized for reports
  gradeKey:        varchar('grade_key', { length: 30 }),       // denormalized for reports
  cardSnapshot:    text('card_snapshot'),                       // full JSON card at time of tx
  isOffline:       boolean('is_offline').default(false),
  localId:         varchar('local_id', { length: 255 }).unique(), // mobile SQLite UUID dedup
  rslCardId:       varchar('rsl_card_id', { length: 255 }),     // global catalog link
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  rslCardIdIdx: drizzleIndex('idx_transactions_rsl_card_id').on(t.rslCardId),
  txUserIdIdx: drizzleIndex('idx_transactions_user_id').on(t.userId),
  txInventoryIdIdx: drizzleIndex('idx_transactions_inventory_id').on(t.inventoryId),
  txCustomerIdIdx: drizzleIndex('idx_transactions_customer_id').on(t.customerId),
  txDailyLogIdx: drizzleIndex('idx_transactions_daily_log_id').on(t.dailyLogId),
  txDailyLogTypeIdx: drizzleIndex('idx_transactions_daily_log_type').on(t.dailyLogId, t.type),
  // Composite indexes for fast dashboard revenue charts, recent sales & pagination
  txUserTypeCreatedIdx: drizzleIndex('idx_transactions_user_type_created').on(t.userId, t.type, t.createdAt),

  txUserCreatedIdx: drizzleIndex('idx_transactions_user_created').on(t.userId, t.createdAt),
  txChannelIdx: drizzleIndex('idx_transactions_channel').on(t.channel),
}))

export const tradeItems = pgTable('trade_items', {
  id:             uuid('id').primaryKey().defaultRandom(),
  transactionId:  uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  direction:      varchar('direction', { length: 10 }).notNull(), // given | received
  inventoryId:    uuid('inventory_id').references(() => inventory.id),
  playerName:     varchar('player_name', { length: 255 }),
  gradeKey:       varchar('grade_key', { length: 30 }),
  marketValue:    decimal('market_value', { precision: 10, scale: 2 }),
  cashAdjustment: decimal('cash_adjustment', { precision: 10, scale: 2 }).default('0'),
}, (t) => ({
  tradeTxIdIdx: drizzleIndex('idx_trade_items_tx_id').on(t.transactionId),
  tradeInventoryIdIdx: drizzleIndex('idx_trade_items_inventory_id').on(t.inventoryId),
}))

export const offlineSyncQueue = pgTable('offline_sync_queue', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').references(() => users.id).notNull(),
  localId:   varchar('local_id', { length: 255 }).notNull().unique(),
  type:      txTypeEnum('type').notNull(),
  payload:   text('payload').notNull(),   // full JSON transaction payload
  synced:    boolean('synced').default(false),
  syncedAt:  timestamp('synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  syncQueueUserIdIdx: drizzleIndex('idx_offline_sync_user_id').on(t.userId),
}))

export const mvDailyLogStats = pgMaterializedView('mv_daily_log_stats').as((qb) => {
  const sql = require('drizzle-orm').sql
  return qb.select({
    dailyLogId: transactions.dailyLogId,
    moneyIn: sql<string>`sum(case when ${transactions.type} = 'sell' then ${transactions.price} else 0 end)`.as('money_in'),
    moneyOut: sql<string>`sum(case when ${transactions.type} = 'buy' then ${transactions.price} else 0 end)`.as('money_out'),
    profit: sql<string>`sum(${transactions.profit})`.as('profit'),
    cardsBought: sql<number>`count(case when ${transactions.type} = 'buy' then 1 end)`.as('cards_bought'),
    cardsSold: sql<number>`count(case when ${transactions.type} = 'sell' then 1 end)`.as('cards_sold'),
  })
  .from(transactions)
  .where(sql`${transactions.dailyLogId} is not null`)
  .groupBy(transactions.dailyLogId)
})
