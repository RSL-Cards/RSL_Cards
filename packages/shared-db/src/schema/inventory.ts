// shared/db/schema/inventory.ts
import { pgTable, uuid, varchar, text, boolean, timestamp, decimal, integer, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const listingStatusEnum = pgEnum('listing_status', ['unlisted', 'listed', 'sold', 'consignment'])
export const gradeCompanyEnum = pgEnum('grade_company', ['PSA', 'BGS', 'SGC', 'CGC', 'RAW'])

export const inventory = pgTable('inventory', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  userId:               uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cardId:               varchar('card_id', { length: 255 }),       // ref to card_db
  playerName:           varchar('player_name', { length: 255 }).notNull(),
  year:                 integer('year'),
  setName:              varchar('set_name', { length: 255 }),
  variation:            varchar('variation', { length: 255 }),      // Prizm Silver, Holo, Base
  cardNumber:           varchar('card_number', { length: 50 }),
  sport:                varchar('sport', { length: 50 }),
  gradeCompany:         gradeCompanyEnum('grade_company'),
  gradeValue:           varchar('grade_value', { length: 10 }),     // '10', '9.5', '8'
  certNumber:           varchar('cert_number', { length: 100 }),    // PSA/BGS cert
  costBasis:            decimal('cost_basis', { precision: 10, scale: 2 }).notNull(),
  currentMarketValue:   decimal('current_market_value', { precision: 10, scale: 2 }),
  quantity:             integer('quantity').default(1),
  printRun:             integer('print_run'),                       // 99, 25, 10, 1
  printRunSerial:       integer('print_run_serial'),               // which number (e.g. 47 of 99)
  isConsignment:        boolean('is_consignment').default(false),
  consignmentOwner:     varchar('consignment_owner', { length: 255 }),
  consignmentCommPct:   decimal('consignment_comm_pct', { precision: 5, scale: 2 }),
  listingStatus:        listingStatusEnum('listing_status').default('unlisted'),
  listedPlatforms:      text('listed_platforms').array(),           // ['ebay','whatnot']
  photos:               text('photos').array(),                      // S3 URLs
  notes:                text('notes'),
  isRookie:             boolean('is_rookie').default(false),
  isAutograph:          boolean('is_autograph').default(false),
  isRelic:              boolean('is_relic').default(false),
  lastRevaluedAt:       timestamp('last_revalued_at', { withTimezone: true }),
  addedAt:              timestamp('added_at', { withTimezone: true }).defaultNow(),
  soldAt:               timestamp('sold_at', { withTimezone: true }),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const bulkImportJobs = pgTable('bulk_import_jobs', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').references(() => users.id).notNull(),
  status:       varchar('status', { length: 50 }).default('pending'), // pending|processing|done|failed
  fileName:     varchar('file_name', { length: 255 }),
  totalRows:    integer('total_rows'),
  processedRows: integer('processed_rows').default(0),
  errorRows:    integer('error_rows').default(0),
  s3Key:        varchar('s3_key', { length: 500 }),
  errorLog:     text('error_log'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
})
