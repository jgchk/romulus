import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core'

import { artists } from './artists'
import { releases } from './releases'
import { tracks } from './tracks'

export type InsertReleaseIssue = InferInsertModel<typeof releaseIssues>
export type ReleaseIssue = InferSelectModel<typeof releaseIssues>
export const releaseIssues = pgTable('ReleaseIssue', {
  id: serial('id').primaryKey().notNull(),
  releaseId: integer('release_id')
    .notNull()
    .references(() => releases.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  title: text('title').notNull(),
  art: text('art'),
})

export const releaseIssuesRelations = relations(releaseIssues, ({ one, many }) => ({
  release: one(releases, {
    fields: [releaseIssues.releaseId],
    references: [releases.id],
  }),
  artists: many(releaseIssueArtists),
  tracks: many(releaseIssueTracks),
}))

export type InsertReleaseIssueArtist = InferInsertModel<typeof releaseIssueArtists>
export type ReleaseIssueArtist = InferSelectModel<typeof releaseIssueArtists>
export const releaseIssueArtists = pgTable(
  'ReleaseIssueArtist',
  {
    releaseIssueId: integer('release_issue_id')
      .references(() => releaseIssues.id, {
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
    pk: primaryKey({ columns: [table.releaseIssueId, table.artistId] }),
  }),
)

export const releaseIssueArtistsRelations = relations(releaseIssueArtists, ({ one }) => ({
  releaseIssue: one(releaseIssues, {
    fields: [releaseIssueArtists.releaseIssueId],
    references: [releaseIssues.id],
  }),
  artist: one(artists, {
    fields: [releaseIssueArtists.artistId],
    references: [artists.id],
  }),
}))

export type InsertReleaseIssueTrack = InferInsertModel<typeof releaseIssueTracks>
export type ReleaseIssueTrack = InferSelectModel<typeof releaseIssueTracks>
export const releaseIssueTracks = pgTable(
  'ReleaseIssueTrack',
  {
    releaseIssueId: integer('release_issue_id')
      .references(() => releaseIssues.id, {
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
    pk: primaryKey({ columns: [table.releaseIssueId, table.trackId] }),
  }),
)

export const releaseIssueTracksRelations = relations(releaseIssueTracks, ({ one }) => ({
  releaseIssue: one(releaseIssues, {
    fields: [releaseIssueTracks.releaseIssueId],
    references: [releaseIssues.id],
  }),
  track: one(tracks, {
    fields: [releaseIssueTracks.trackId],
    references: [tracks.id],
  }),
}))
