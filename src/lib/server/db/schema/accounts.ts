import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const permissions = pgEnum('Permission', ['EDIT_GENRES', 'EDIT_RELEASES'])

export type InsertAccount = InferInsertModel<typeof accounts>
export type Account = InferSelectModel<typeof accounts>
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
  showNsfw: boolean('showNsfw').default(false).notNull(),
})

export type InsertSession = InferInsertModel<typeof sessions>
export type Session = InferSelectModel<typeof sessions>
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

export type InsertPasswordResetToken = InferInsertModel<typeof passwordResetTokens>
export type PasswordResetToken = InferSelectModel<typeof passwordResetTokens>
export const passwordResetTokens = pgTable('PasswordResetToken', {
  tokenHash: text('token_hash').unique().notNull(),
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

export type InsertApiKey = InferInsertModel<typeof apiKeys>
export type ApiKey = InferSelectModel<typeof apiKeys>
export const apiKeys = pgTable('ApiKey', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  keyHash: text('key_hash').unique().notNull(),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  createdAt: timestamp('createdAt', { precision: 3 }).defaultNow().notNull(),
})
