import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate as drizzleMigrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import { withProps } from '../utils.js'
import * as schema from './drizzle-schema.js'

export function getPostgresConnection(databaseUrl: string) {
  const pg = postgres(databaseUrl)

  return pg
}

export function getDbConnection(pg: postgres.Sql) {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return withProps(drizzleClient, { close: () => pg.end() })
}

export async function migrate<S extends Record<string, unknown>>(db: PostgresJsDatabase<S>) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const migrationsFolder = path.join(__dirname, './migrations')
  await drizzleMigrate(db, { migrationsFolder })
}
