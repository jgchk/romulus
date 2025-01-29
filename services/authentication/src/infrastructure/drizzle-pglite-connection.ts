import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { PGlite } from '@electric-sql/pglite'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate as drizzleMigrate } from 'drizzle-orm/pglite/migrator'

import { withProps } from '../utils.js'
import * as schema from './drizzle-schema.js'

export function getPGlitePostgresConnection() {
  return new PGlite()
}

export function getPGliteDbConnection(pg: PGlite) {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return withProps(drizzleClient, { close: () => pg.close() })
}

export async function migratePGlite<S extends Record<string, unknown>>(db: PgliteDatabase<S>) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const migrationsFolder = path.join(__dirname, './migrations')
  await drizzleMigrate(db, { migrationsFolder })
}
