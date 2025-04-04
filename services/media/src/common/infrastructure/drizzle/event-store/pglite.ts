import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'

import { withProps } from '../../../../utils.js'
import * as schema from './schema.js'

export function getPGlitePostgresConnection() {
  return new PGlite()
}

export function getPGliteDbConnection(pg = getPGlitePostgresConnection()) {
  const drizzleClient = drizzle(pg, {
    schema,
    logger: process.env.LOGGING === 'true',
  })

  return withProps(drizzleClient, { close: () => pg.close() })
}
