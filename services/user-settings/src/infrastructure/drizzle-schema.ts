import { boolean, integer, pgTable } from 'drizzle-orm/pg-core'

export const userSettingsTable = pgTable('user_settings', {
  id: integer('id').primaryKey().notNull(),
  genreRelevanceFilter: integer('genreRelevanceFilter').notNull(),
  showRelevanceTags: boolean('showRelevanceTags').notNull(),
  showTypeTags: boolean('showTypeTags').notNull(),
  showNsfw: boolean('showNsfw').notNull(),
  darkMode: boolean('darkMode').notNull(),
})
