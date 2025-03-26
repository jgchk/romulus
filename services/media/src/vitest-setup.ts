import { sql } from 'drizzle-orm'
import { afterAll, test as base } from 'vitest'

import type { IDrizzleConnection } from './simple/queries/infrastructure/drizzle-database.js'
import {
  getPGliteDbConnection,
  getPGlitePostgresConnection,
  migratePGlite,
} from './simple/queries/infrastructure/drizzle-pglite-connection.js'

const pg = getPGlitePostgresConnection()
const db = getPGliteDbConnection(pg)

afterAll(async () => {
  await pg.close()
})

export const test = base.extend<{ dbConnection: IDrizzleConnection }>({
  // eslint-disable-next-line no-empty-pattern
  dbConnection: async ({}, use) => {
    await migratePGlite(db)

    await use(db)

    await db.execute(sql`drop schema if exists public cascade`)
    await db.execute(sql`create schema public`)
    await db.execute(sql`drop schema if exists drizzle cascade`)
  },
})
