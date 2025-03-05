import postgres from 'postgres'

import { env } from '../env.js'

export async function migrateAccounts(
  migrateSchema: () => Promise<void>,
  execQuery: (query: string) => Promise<void>,
) {
  await migrateSchema()

  const monolith = postgres(env.MONOLITH_DATABASE_URL)

  const accounts = (await monolith`SELECT * FROM "Account"`).map((row) => ({
    id: row.id as number,
    username: row.username as string,
    password: row.password as string,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
  }))
  await execQuery(`
    INSERT INTO "Account"
      (id, username, password, "createdAt", "updatedAt")
    VALUES
      ${accounts.map((account) => `(${account.id}, '${account.username}', '${account.password}', '${account.createdAt.toISOString()}', '${account.updatedAt.toISOString()}')`).join(', ')}
  `)

  const apiKeys = (await monolith`SELECT * from "ApiKey"`).map((row) => ({
    keyHash: row.key_hash as string,
    accountId: row.account_id as number,
    name: row.name as string,
    createdAt: row.createdAt as Date,
    id: row.id as number,
  }))
  await execQuery(`
    INSERT INTO "ApiKey"
      (id, name, key_hash, account_id, "createdAt")
    VALUES
      ${apiKeys.map((apiKey) => `(${apiKey.id}, '${apiKey.name}', '${apiKey.keyHash}', ${apiKey.accountId}, '${apiKey.createdAt.toISOString()}')`).join(', ')}
  `)
}
