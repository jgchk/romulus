import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'

import type * as schema from './drizzle-schema'

export type IDrizzleConnection = PgDatabase<PgQueryResultHKT, typeof schema> & {
  close: () => Promise<void>
}
