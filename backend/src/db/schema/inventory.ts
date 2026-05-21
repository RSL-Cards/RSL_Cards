import { pgTable, uuid, varchar, decimal, integer, boolean, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { players, cards, cardVariants } from './carddb'

export const listingStatusEnum = pgEnum('listing_status', ['unlisted','listed','sold','archived'])
export const gradeCompanyEnum  = pgEnum('grade_company', ['PSA','BGS','SGC','CSG','RAW'])

export const inventory = pgTable('inventory', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  userId:               uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cardId:               varchar('card_id', { length: 255 }).references(() => cards.id), 
  variantId:            uuid('variant_id').references(() => cardVariants.id),
  playerId:             uuid('player_id').references(() => players.id),
  year:                 integer('year'),
  setName:              varchar('set_name', { length: 255 }),
  variation:            varchar('variation', { length: 255 }),
  cardNumber:           varchar('card_number', { length: 50 }),
  sport:                varchar('sport', { length: 50 }),
  gradeCompany:         varchar('grade_company', { length: 50 }),             // PSA | BGS | SGC | RAW | GMA
  gradeValue:           varchar('grade_value', { length: 10 }),        // 10 | 9.5 | 9 | NM-MT
  gradeKey:             varchar('grade_key', { length: 30 }),          // PSA_10 | BGS_9.5 | RAW
  certNumber:           varchar('cert_number', { length: 50 }),        // PSA/BGS cert for barcode scan
  costBasis:            decimal('cost_basis', { precision: 10, scale: 2 }).notNull(),
  currentMarketValue:   decimal('current_market_value', { precision: 10, scale: 2 }),
  unrealizedGain:       decimal('unrealized_gain', { precision: 10, scale: 2 }),
  quantity:             integer('quantity').default(1),
  isConsignment:        boolean('is_consignment').default(false),
  ebaySalesCompleted:   text('ebay_sales_completed'),                  // JSON string of raw ebay sales
  ebayActiveListings:   text('ebay_active_listings'),                  // JSON string of raw active listings
  consignmentOwner:     varchar('consignment_owner', { length: 255 }),
  consignmentCommPct:   decimal('consignment_comm_pct', { precision: 5, scale: 2 }),
  listedPlatforms:      text('listed_platforms').array(),              // ['ebay','whatnot']
  listingStatus:        listingStatusEnum('listing_status').default('unlisted'),
  photos:               text('photos').array(),                        // S3 URLs
  notes:                text('notes'),
  addedAt:              timestamp('added_at', { withTimezone: true }).defaultNow(),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const bulkPurchases = pgTable('bulk_purchases', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').references(() => users.id).notNull(),
  totalPrice:   decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  itemCount:    integer('item_count').notNull(),
  paymentMethod:varchar('payment_method', { length: 50 }),
  notes:        text('notes'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
})
