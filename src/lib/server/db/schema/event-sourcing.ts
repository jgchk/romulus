import { bigint, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const events = pgTable('events', {
  id: uuid('id').primaryKey(),
  streamName: text('stream_name').notNull(),
  eventType: text('event_type').notNull(),
  data: jsonb('data').notNull(),
  version: bigint('version', { mode: 'number' }).notNull(),
  sequence: bigint('sequence', { mode: 'number' }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
})
