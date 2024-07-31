import './app.css'

import * as matchers from '@testing-library/jest-dom/matchers'
import { afterEach, beforeEach, expect, test as base, vi } from 'vitest'

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

export const test = base.extend<{ dbConnection: IDrizzleConnection }>({
  // eslint-disable-next-line no-empty-pattern
  dbConnection: async ({}, use) => {
    const pg = getPostgresConnection()
    const db = getDbConnection(pg)
    await migrate(db)
    await use(db)
    await pg.close()
  },
})
