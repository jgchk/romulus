import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate as drizzleMigrate } from 'drizzle-orm/postgres-js/migrator'
import path from 'path'
import postgres from 'postgres'
import { fileURLToPath } from 'url'

export const getPostgresConnection = (databaseUrl = process.env.DATABASE_URL) => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const pg = postgres(databaseUrl)

  return pg
}

export const getDbConnection = <S extends Record<string, unknown>>(
  schema: S,
  pg = getPostgresConnection(),
) => {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return drizzleClient
}

export async function migrate<S extends Record<string, unknown>>(db: PostgresJsDatabase<S>) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const migrationsFolder = path.join(__dirname, '../migrations')

  console.log('Migrating database with migrations from:', migrationsFolder)

  await drizzleMigrate(db, { migrationsFolder })

  console.log('Database migrated successfully!')
}
