import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const accountsTable = pgTable('Account', {
  id: serial('id').primaryKey().notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('createdAt', { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3 }).defaultNow().notNull(),
})

export const sessionsTable = pgTable('Session', {
  tokenHash: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => accountsTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})

export const passwordResetTokensTable = pgTable('PasswordResetToken', {
  tokenHash: text('token_hash').unique().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => accountsTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})
