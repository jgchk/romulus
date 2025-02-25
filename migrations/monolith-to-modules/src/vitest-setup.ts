import { PGlite } from '@electric-sql/pglite'
import { afterAll, test as base } from 'vitest'

const pg = new PGlite()

afterAll(async () => {
  await pg.close()
})

export const test = base.extend<{ dbConnection: PGlite }>({
  // eslint-disable-next-line no-empty-pattern
  dbConnection: async ({}, use) => {
    await use(pg)

    await pg.exec('drop schema if exists public cascade')
    await pg.exec('create schema public')
    await pg.exec('drop schema if exists drizzle cascade')
  },
})
