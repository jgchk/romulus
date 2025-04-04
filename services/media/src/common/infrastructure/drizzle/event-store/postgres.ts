import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { withProps } from '../../../../utils.js'
import * as schema from './schema.js'

export function getPostgresConnection(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const pg = postgres(databaseUrl)

  return pg
}

export function getDbConnection(pg = getPostgresConnection()) {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return withProps(drizzleClient, { close: () => pg.end() })
}
