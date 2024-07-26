import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

export type DbConnection = PostgresJsDatabase<typeof schema>

export const getPostgresConnection = (databaseUrl = process.env.DATABASE_URL) => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const pg = postgres(databaseUrl)

  return pg
}

export const getDbConnection = (pg = getPostgresConnection()): DbConnection => {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return drizzleClient
}
