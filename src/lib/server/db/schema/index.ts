import { type InferSelectModel, relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { GENRE_OPERATIONS, GENRE_TYPES } from '../../../types/genres'

export const genreOperations = pgEnum('GenreOperation', GENRE_OPERATIONS)

export const genreTypes = pgEnum('GenreType', GENRE_TYPES)

export const permissions = pgEnum('Permission', [
  'EDIT_RELEASES',
  'EDIT_ARTISTS',
  'MIGRATE_CONTRIBUTORS',
  'EDIT_GENRES',
])

export const genres = pgTable('Genre', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  subtitle: text('subtitle'),
  type: genreTypes('type').default('STYLE').notNull(),
  relevance: integer('relevance').default(99).notNull(),
  shortDescription: text('shortDescription'),
  longDescription: text('longDescription'),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
})

export const genresRelations = relations(genres, ({ many }) => ({
  akas: many(genreAkas),
  parents: many(genreParents, { relationName: 'children' }),
  children: many(genreParents, { relationName: 'parents' }),
  influencedBy: many(genreInfluences, { relationName: 'influenced' }),
  influences: many(genreInfluences, { relationName: 'influencers' }),
  history: many(genreHistory),
}))

export type GenreHistory = InferSelectModel<typeof genreHistory>
export const genreHistory = pgTable('GenreHistory', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  type: genreTypes('type').default('STYLE').notNull(),
  shortDescription: text('shortDescription'),
  longDescription: text('longDescription'),
  notes: text('notes'),
  parentGenreIds: integer('parentGenreIds').array(),
  influencedByGenreIds: integer('influencedByGenreIds').array(),
  treeGenreId: integer('treeGenreId').notNull(),
  createdAt: timestamp('createdAt', { precision: 3 }).defaultNow().notNull(),
  operation: genreOperations('operation').notNull(),
  accountId: integer('accountId').references(() => accounts.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  subtitle: text('subtitle'),
})

export const genreHistoryRelations = relations(genreHistory, ({ many, one }) => ({
  genre: one(genres, {
    fields: [genreHistory.treeGenreId],
    references: [genres.id],
  }),
  akas: many(genreHistoryAkas),
  account: one(accounts, {
    fields: [genreHistory.accountId],
    references: [accounts.id],
  }),
}))

export const accounts = pgTable('Account', {
  id: serial('id').primaryKey().notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  darkMode: boolean('darkMode').default(true).notNull(),
  permissions: permissions('permissions').array(),
  createdAt: timestamp('createdAt', { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3 }).defaultNow().notNull(),
  genreRelevanceFilter: integer('genreRelevanceFilter').default(1).notNull(),
  showRelevanceTags: boolean('showRelevanceTags').default(false).notNull(),
  showTypeTags: boolean('showTypeTags').default(true).notNull(),
})

export const sessions = pgTable('Session', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => accounts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})

export const genreParents = pgTable(
  'GenreParents',
  {
    parentId: integer('parentId')
      .notNull()
      .references(() => genres.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    childId: integer('childId')
      .notNull()
      .references(() => genres.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.parentId, table.childId] }),
  }),
)

export const genreParentsRelations = relations(genreParents, ({ one }) => ({
  parent: one(genres, {
    fields: [genreParents.parentId],
    references: [genres.id],
    relationName: 'parents',
  }),
  child: one(genres, {
    fields: [genreParents.childId],
    references: [genres.id],
    relationName: 'children',
  }),
}))

export const genreInfluences = pgTable(
  'GenreInfluences',
  {
    influencedId: integer('influencedId')
      .notNull()
      .references(() => genres.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    influencerId: integer('influencerId')
      .notNull()
      .references(() => genres.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.influencerId, table.influencedId] }),
  }),
)

export const genreInfluencesRelations = relations(genreInfluences, ({ one }) => ({
  influencer: one(genres, {
    fields: [genreInfluences.influencerId],
    references: [genres.id],
    relationName: 'influencers',
  }),
  influenced: one(genres, {
    fields: [genreInfluences.influencedId],
    references: [genres.id],
    relationName: 'influenced',
  }),
}))

export const genreHistoryAkas = pgTable(
  'GenreHistoryAka',
  {
    genreId: integer('genreId')
      .notNull()
      .references(() => genreHistory.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    name: text('name').notNull(),
    relevance: integer('relevance').notNull(),
    order: integer('order').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.genreId, table.name] }),
  }),
)

export const genreHistoryAkasRelations = relations(genreHistoryAkas, ({ one }) => ({
  genreHistory: one(genreHistory, {
    fields: [genreHistoryAkas.genreId],
    references: [genreHistory.id],
  }),
}))

export const genreAkas = pgTable(
  'GenreAka',
  {
    genreId: integer('genreId')
      .notNull()
      .references(() => genres.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    name: text('name').notNull(),
    relevance: integer('relevance').notNull(),
    order: integer('order').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.genreId, table.name] }),
  }),
)

export const genreAkasRelations = relations(genreAkas, ({ one }) => ({
  genre: one(genres, {
    fields: [genreAkas.genreId],
    references: [genres.id],
  }),
}))

export const genreRelevanceVotes = pgTable(
  'GenreRelevanceVote',
  {
    genreId: integer('genreId')
      .notNull()
      .references(() => genres.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    accountId: integer('accountId')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    relevance: integer('relevance').notNull(),
    createdAt: timestamp('createdAt', { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.genreId, table.accountId] }),
  }),
)
