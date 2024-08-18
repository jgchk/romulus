import { type InferInsertModel, type InferSelectModel, relations } from 'drizzle-orm'
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

import {
  DEFAULT_GENRE_TYPE,
  GENRE_OPERATIONS,
  GENRE_TYPES,
  UNSET_GENRE_RELEVANCE,
} from '../../../types/genres'
import { accounts } from './accounts'

export const genreOperations = pgEnum('GenreOperation', GENRE_OPERATIONS)

export const genreTypes = pgEnum('GenreType', GENRE_TYPES)

export type InsertGenre = InferInsertModel<typeof genres>
export type Genre = InferSelectModel<typeof genres>
export const genres = pgTable('Genre', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  subtitle: text('subtitle'),
  type: genreTypes('type').default(DEFAULT_GENRE_TYPE).notNull(),
  relevance: integer('relevance').default(UNSET_GENRE_RELEVANCE).notNull(),
  nsfw: boolean('nsfw').default(false).notNull(),
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

export type InsertGenreHistory = InferInsertModel<typeof genreHistory>
export type GenreHistory = InferSelectModel<typeof genreHistory>
export const genreHistory = pgTable('GenreHistory', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  type: genreTypes('type').default('STYLE').notNull(),
  shortDescription: text('shortDescription'),
  longDescription: text('longDescription'),
  nsfw: boolean('nsfw').default(false).notNull(),
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

export type InsertGenreParent = InferInsertModel<typeof genreParents>
export type GenreParent = InferSelectModel<typeof genreParents>
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

export type InsertGenreInfluence = InferInsertModel<typeof genreInfluences>
export type GenreInfluence = InferSelectModel<typeof genreInfluences>
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

export type InsertGenreHistoryAka = InferInsertModel<typeof genreHistoryAkas>
export type GenreHistoryAka = InferSelectModel<typeof genreHistoryAkas>
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

export type InsertGenreAka = InferInsertModel<typeof genreAkas>
export type GenreAka = InferSelectModel<typeof genreAkas>
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

export type InsertGenreRelevanceVote = InferInsertModel<typeof genreRelevanceVotes>
export type GenreRelevanceVote = InferSelectModel<typeof genreRelevanceVotes>
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
