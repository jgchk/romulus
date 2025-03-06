import postgres from 'postgres'

import { env } from '../env.js'

export async function migrateAccounts(
  migrateSchema: () => Promise<void>,
  execQuery: (query: string) => Promise<void>,
) {
  await migrateSchema()

  const monolith = postgres(env.MONOLITH_DATABASE_URL)

  await migrateUserAccounts(monolith, execQuery)
  await migrateApiKeys(monolith, execQuery)
  await migratePasswordResetTokens(monolith, execQuery)
  await migrateSessions(monolith, execQuery)
}

async function migrateUserAccounts(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const accounts = (await monolith`SELECT * FROM "Account"`).map((row) => ({
    id: row.id as number,
    username: row.username as string,
    password: row.password as string,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
  }))

  if (accounts.length === 0) return

  await execQuery(`
    INSERT INTO "Account"
      (id, username, password, "createdAt", "updatedAt")
    VALUES
      ${accounts.map((account) => `(${account.id}, '${account.username}', '${account.password}', '${account.createdAt.toISOString()}', '${account.updatedAt.toISOString()}')`).join(', ')}
  `)
}

async function migrateApiKeys(monolith: postgres.Sql, execQuery: (query: string) => Promise<void>) {
  const apiKeys = (await monolith`SELECT * from "ApiKey"`).map((row) => ({
    keyHash: row.key_hash as string,
    accountId: row.account_id as number,
    name: row.name as string,
    createdAt: row.createdAt as Date,
    id: row.id as number,
  }))

  if (apiKeys.length === 0) return

  await execQuery(`
    INSERT INTO "ApiKey"
      (id, name, key_hash, account_id, "createdAt")
    VALUES
      ${apiKeys.map((apiKey) => `(${apiKey.id}, '${apiKey.name}', '${apiKey.keyHash}', ${apiKey.accountId}, '${apiKey.createdAt.toISOString()}')`).join(', ')}
  `)
}

async function migratePasswordResetTokens(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const passwordResetTokens = (await monolith`SELECT * from "PasswordResetToken"`).map((row) => ({
    tokenHash: row.token_hash as string,
    userId: row.user_id as number,
    expiresAt: row.expires_at as Date,
  }))

  if (passwordResetTokens.length === 0) return

  await execQuery(`
    INSERT INTO "PasswordResetToken"
      (token_hash, user_id, expires_at)
    VALUES
      ${passwordResetTokens.map((token) => `('${token.tokenHash}', ${token.userId}, '${token.expiresAt.toISOString()}')`).join(', ')}
  `)
}

async function migrateSessions(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const sessions = (await monolith`SELECT * from "Session"`).map((row) => ({
    tokenHash: row.id as string,
    userId: row.user_id as number,
    expiresAt: row.expires_at as Date,
  }))

  if (sessions.length === 0) return

  await execQuery(`
    INSERT INTO "Session"
      (id, user_id, expires_at)
    VALUES
      ${sessions.map((session) => `('${session.tokenHash}', ${session.userId}, '${session.expiresAt.toISOString()}')`).join(', ')}
  `)
}
