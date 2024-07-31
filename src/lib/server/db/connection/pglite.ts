import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate as drizzleMigrate } from 'drizzle-orm/pglite/migrator'
import path from 'path'
import { fileURLToPath } from 'url'

import * as schema from '../schema'

export const getPostgresConnection = () => {
  return new PGlite()
}

export const getDbConnection = (pg = getPostgresConnection()) => {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return drizzleClient
}

export async function migrate(db = getDbConnection()) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const migrationsFolder = path.join(__dirname, '../migrations')
  await drizzleMigrate(db, { migrationsFolder })
}
