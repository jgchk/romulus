import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core'

import { artists } from './artists'
import { releaseIssues } from './release-issues'
import { tracks } from './tracks'

export type InsertRelease = InferInsertModel<typeof releases>
export type Release = InferSelectModel<typeof releases>
export const releases = pgTable('Release', {
  id: serial('id').primaryKey().notNull(),
  title: text('title').notNull(),
  art: text('art'),
})

export const releasesRelations = relations(releases, ({ many }) => ({
  artists: many(releaseArtists),
  tracks: many(releaseTracks),
  issues: many(releaseIssues),
}))

export type InsertReleaseArtist = InferInsertModel<typeof releaseArtists>
export type ReleaseArtist = InferSelectModel<typeof releaseArtists>
export const releaseArtists = pgTable(
  'ReleaseArtist',
  {
    releaseId: integer('release_id')
      .references(() => releases.id, {
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
    pk: primaryKey({ columns: [table.releaseId, table.artistId] }),
  }),
)

export const releaseArtistsRelations = relations(releaseArtists, ({ one }) => ({
  release: one(releases, {
    fields: [releaseArtists.releaseId],
    references: [releases.id],
  }),
  artist: one(artists, {
    fields: [releaseArtists.artistId],
    references: [artists.id],
  }),
}))

export type InsertReleaseTrack = InferInsertModel<typeof releaseTracks>
export type ReleaseTrack = InferSelectModel<typeof releaseTracks>
export const releaseTracks = pgTable(
  'ReleaseTrack',
  {
    releaseId: integer('release_id')
      .references(() => releases.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
    trackId: integer('track_id')
      .references(() => tracks.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
    order: integer('order').notNull(),

    title: text('title'),
    durationMs: integer('duration_ms'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.releaseId, table.trackId] }),
  }),
)

export const releaseTracksRelations = relations(releaseTracks, ({ one }) => ({
  release: one(releases, {
    fields: [releaseTracks.releaseId],
    references: [releases.id],
  }),
  track: one(tracks, {
    fields: [releaseTracks.trackId],
    references: [tracks.id],
  }),
}))
