import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm'
import { pgTable, serial, text } from 'drizzle-orm/pg-core'

import { releaseArtists } from './releases'
import { trackArtists } from './tracks'

export type InsertArtist = InferInsertModel<typeof artists>
export type Artist = InferSelectModel<typeof artists>
export const artists = pgTable('Artist', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
})

export const artistsRelations = relations(artists, ({ many }) => ({
  releases: many(releaseArtists),
  tracks: many(trackArtists),
}))
