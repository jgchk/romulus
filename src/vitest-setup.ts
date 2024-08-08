import './app.css'

import * as matchers from '@testing-library/jest-dom/matchers'
import { sql } from 'drizzle-orm'
import { afterAll, afterEach, beforeEach, expect, test as base, vi } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { getDbConnection, getPostgresConnection, migrate } from '$lib/server/db/connection/pglite'

expect.extend(matchers)

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      matchers.TestingLibraryMatchers<T, void> {}
}

beforeEach(() => {
  const raf = (fn: (date: Date) => void) => setTimeout(() => fn(new Date()), 16)
  vi.stubGlobal('requestAnimationFrame', raf)
})

// Alternatively, set `unstubGlobals: true` in vitest.config.js
afterEach(() => {
  vi.unstubAllGlobals()
})

const pg = getPostgresConnection()
const db = getDbConnection(pg)

afterAll(async () => {
  await pg.close()
})

export const test = base
  .extend<{ dbConnection: IDrizzleConnection }>({
    // eslint-disable-next-line no-empty-pattern
    dbConnection: async ({}, use) => {
      await migrate(db)

      await use(db)

      await db.execute(sql`drop schema if exists public cascade`)
      await db.execute(sql`create schema public`)
      await db.execute(sql`drop schema if exists drizzle cascade`)
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
