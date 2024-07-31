import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'

import * as schema from '../schema'

export type IDrizzleConnection = PgDatabase<PgQueryResultHKT, typeof schema>
