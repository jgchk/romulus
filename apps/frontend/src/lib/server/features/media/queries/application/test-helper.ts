import { sql } from 'drizzle-orm'
import { afterAll, test as base } from 'vitest'

import { getDbConnection, getPostgresConnection, migrate } from '$lib/server/db/connection/pglite'

import type { MediaTypeTreeEvent } from '../../shared/domain/events'
import { MediaTypeTreesProjectionBuilder } from '../domain/media-type-tree-db'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import * as schema from '../infrastructure/drizzle-schema'
import { GetMediaTypeTreeQuery, GetMediaTypeTreeQueryHandler } from './get-media-type-tree'

export class TestHelper {
  private db: IDrizzleConnection
  private projection: MediaTypeTreesProjectionBuilder

  constructor(db: IDrizzleConnection) {
    this.db = db
    this.projection = MediaTypeTreesProjectionBuilder.create(db)
  }

  async given(events: MediaTypeTreeEvent[]): Promise<void> {
    for (const event of events) {
      await this.projection.receiveEvent(event)
    }
  }

  async when<Q extends Query>(query: Q) {
    const error = await this.executeQuery(query)
    return error
  }

  private executeQuery<Q extends Query>(query: Q) {
    if (query instanceof GetMediaTypeTreeQuery) {
      return new GetMediaTypeTreeQueryHandler(this.db).handle(query)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = query
    }
  }
  /* eslint-enabled returned-errors/enforce-error-handling */
}

export type Query = GetMediaTypeTreeQuery

const pg = getPostgresConnection()
const db = getDbConnection(schema, pg)

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
  .extend<{ t: TestHelper }>({
    t: async ({ dbConnection }, use) => {
      const t = new TestHelper(dbConnection)
      await use(t)
    },
  })
