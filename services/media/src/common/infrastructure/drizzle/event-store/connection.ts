import { type PgDatabase, type PgQueryResultHKT } from 'drizzle-orm/pg-core'

import type * as schema from './schema.js'

export type IDrizzleEventStoreConnection = PgDatabase<PgQueryResultHKT, typeof schema> & {
  close: () => Promise<void>
}
