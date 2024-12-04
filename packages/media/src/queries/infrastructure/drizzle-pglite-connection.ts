import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { PGlite } from '@electric-sql/pglite'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate as drizzleMigrate } from 'drizzle-orm/pglite/migrator'

export const getPGlitePostgresConnection = () => {
  return new PGlite()
}

export const getPGliteDbConnection = <S extends Record<string, unknown>>(
  schema: S,
  pg = getPGlitePostgresConnection(),
): PgliteDatabase<S> => {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return drizzleClient
}

export async function migratePGlite<S extends Record<string, unknown>>(db: PgliteDatabase<S>) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const migrationsFolder = path.join(__dirname, './migrations')
  await drizzleMigrate(db, { migrationsFolder })
}
