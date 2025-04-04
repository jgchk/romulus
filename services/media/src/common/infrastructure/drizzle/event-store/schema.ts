import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const eventsTable = pgTable('events', {
  aggregateId: text('aggregate_id').notNull(),
  version: integer('version').notNull(),
  sequence: integer('sequence').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  eventData: jsonb('event_data').notNull(),
})
