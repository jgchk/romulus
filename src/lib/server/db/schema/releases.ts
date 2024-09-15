import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core'

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
