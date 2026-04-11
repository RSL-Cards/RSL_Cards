import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const notifTypeEnum = pgEnum('notif_type', [
  'sale','price_alert','ai_narrative','show_reminder','aging_alert',
  'offer_received','inventory_trending','want_list_match','platform_alert',
  'weekly_digest','new_dealer_inventory','tax_report_ready','system'
])
export const notifChannelEnum = pgEnum('notif_channel', ['push','email','in_app'])
export const notifStatusEnum  = pgEnum('notif_status', ['pending','sent','failed','read'])

export const notifications = pgTable('notifications', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type:      notifTypeEnum('type').notNull(),
  channel:   notifChannelEnum('channel').notNull(),
  status:    notifStatusEnum('status').default('pending'),
  title:     varchar('title', { length: 255 }).notNull(),
  body:      text('body').notNull(),
  data:      text('data'),         // JSON: deep link params e.g. { screen: 'narrative', id: '...' }
  readAt:    timestamp('read_at', { withTimezone: true }),
  sentAt:    timestamp('sent_at', { withTimezone: true }),
  errorMsg:  text('error_msg'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const notificationPreferences = pgTable('notification_preferences', {
  // Same as userPreferences in user service — use user_preferences table there
  // notification-service reads from user_preferences via internal API call
})

// Card Shows
export const cardShows = pgTable('card_shows', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 255 }).notNull(),
  venue:       varchar('venue', { length: 255 }),
  address:     text('address'),
  city:        varchar('city', { length: 100 }),
  state:       varchar('state', { length: 50 }),
  lat:         varchar('lat', { length: 20 }),
  lng:         varchar('lng', { length: 20 }),
  startDate:   timestamp('start_date', { withTimezone: true }).notNull(),
  endDate:     timestamp('end_date', { withTimezone: true }),
  website:     varchar('website', { length: 500 }),
  admission:   varchar('admission', { length: 50 }),
  description: text('description'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const showAttendees = pgTable('show_attendees', {
  id:        uuid('id').primaryKey().defaultRandom(),
  showId:    uuid('show_id').references(() => cardShows.id, { onDelete: 'cascade' }).notNull(),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role:      varchar('role', { length: 20 }).default('attendee'), // dealer | attendee
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
