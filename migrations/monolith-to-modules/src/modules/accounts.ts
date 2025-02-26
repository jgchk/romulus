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

  const query = `
    INSERT INTO "Account"
      (id, username, password, "createdAt", "updatedAt")
    VALUES
      ${accounts.map((account) => `(${account.id}, '${account.username}', '${account.password}', '${account.createdAt.toISOString()}', '${account.updatedAt.toISOString()}')`).join(', ')}
  `
  await execQuery(query)
}
