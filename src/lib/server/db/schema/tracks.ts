import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core'

import { artists } from './artists'
import { releaseTracks } from './releases'

export type InsertTrack = InferInsertModel<typeof tracks>
export type Track = InferSelectModel<typeof tracks>
export const tracks = pgTable('Track', {
  id: serial('id').primaryKey().notNull(),
  title: text('title').notNull(),
  durationMs: integer('duration_ms'),
})

export const tracksRelations = relations(tracks, ({ many }) => ({
  artists: many(trackArtists),
  releases: many(releaseTracks),
}))

export type InsertTrackArtist = InferInsertModel<typeof trackArtists>
export type TrackArtist = InferSelectModel<typeof trackArtists>
export const trackArtists = pgTable(
  'TrackArtist',
  {
    trackId: integer('track_id')
      .references(() => tracks.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
    artistId: integer('artist_id')
      .references(() => artists.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
    order: integer('order').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.trackId, table.artistId] }),
  }),
)

export const trackArtistsRelations = relations(trackArtists, ({ one }) => ({
  track: one(tracks, {
    fields: [trackArtists.trackId],
    references: [tracks.id],
  }),
  artist: one(artists, {
    fields: [trackArtists.artistId],
    references: [artists.id],
  }),
}))
