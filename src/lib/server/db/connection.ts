import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

export type IDrizzleConnection = PgDatabase<PgQueryResultHKT, typeof schema>

export const getPostgresConnection = (databaseUrl = process.env.DATABASE_URL) => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const pg = postgres(databaseUrl)

  return pg
}

export const getDbConnection = (pg = getPostgresConnection()) => {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return drizzleClient
}
