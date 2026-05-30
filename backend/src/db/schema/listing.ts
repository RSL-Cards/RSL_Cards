import { pgTable, uuid, varchar, decimal, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { inventory } from './inventory'

export const listingPlatformEnum = pgEnum('listing_platform', [
  'ebay','whatnot','mercari','tcgplayer','shopify','comc','facebook','goldin','myslabs','instagram'
])
export const platformListingStatusEnum = pgEnum('platform_listing_status',
  ['draft','pending','active','sold','ended','failed'])

export const listings = pgTable('listings', {
  id:                uuid('id').primaryKey().defaultRandom(),
  inventoryId:       uuid('inventory_id').references(() => inventory.id).notNull(),
  userId:            uuid('user_id').references(() => users.id).notNull(),
  platform:          listingPlatformEnum('platform').notNull(),
  platformListingId: varchar('platform_listing_id', { length: 255 }),  // eBay itemId etc
  status:            platformListingStatusEnum('status').default('draft'),
  listPrice:         decimal('list_price', { precision: 10, scale: 2 }).notNull(),
  platformFeePct:    decimal('platform_fee_pct', { precision: 5, scale: 2 }),
  platformFeeAmt:    decimal('platform_fee_amt', { precision: 10, scale: 2 }),
  estimatedShipping: decimal('estimated_shipping', { precision: 10, scale: 2 }),
  netToDealer:       decimal('net_to_dealer', { precision: 10, scale: 2 }),
  title:             text('title'),
  description:       text('description'),
  photos:            text('photos').array(),
  scheduledAt:       timestamp('scheduled_at', { withTimezone: true }),
  listedAt:          timestamp('listed_at', { withTimezone: true }),
  soldAt:            timestamp('sold_at', { withTimezone: true }),
  soldPrice:         decimal('sold_price', { precision: 10, scale: 2 }),
  errorMessage:      text('error_message'),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:         timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
