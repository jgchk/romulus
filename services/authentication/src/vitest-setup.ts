import { test as base, vi } from 'vitest'

import type { IDrizzleConnection } from './infrastructure/drizzle-database.js'
import {
  getPGliteDbConnection,
  getPGlitePostgresConnection,
  migratePGlite,
} from './infrastructure/drizzle-pglite-connection.js'

export const test = base
  .extend<{ dbConnection: IDrizzleConnection }>({
    // eslint-disable-next-line no-empty-pattern
    dbConnection: async ({}, use) => {
      const pg = getPGlitePostgresConnection()
      const db = getPGliteDbConnection(pg)

      await migratePGlite(db)

      await use(db)

      await pg.close()
    },
  })
  .extend<{ withSystemTime: (time: Date) => void }>({
    // eslint-disable-next-line no-empty-pattern
    withSystemTime: async ({}, use) => {
      const withSystemTime = (time: Date) => {
        vi.useFakeTimers()
        vi.setSystemTime(time)
      }

      await use(withSystemTime)

      vi.useRealTimers()
    },
  })
