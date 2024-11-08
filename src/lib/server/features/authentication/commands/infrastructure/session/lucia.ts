import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import type { InferSelectModel } from 'drizzle-orm'
import type { PgDatabase } from 'drizzle-orm/pg-core'
import { Lucia } from 'lucia'
import { omit } from 'ramda'

import { accounts, sessions } from '$lib/server/db/schema'

declare module 'lucia' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    Lucia: AppLucia
    UserId: number
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

type DatabaseUserAttributes = InferSelectModel<typeof accounts>

export type AppLucia = ReturnType<typeof createLucia>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLucia = (db: PgDatabase<any, any, any>) => {
  const adapter = new DrizzlePostgreSQLAdapter(db, sessions, accounts)

  const lucia = new Lucia(adapter, {
    sessionCookie: {
      name: 'auth_session',
      attributes: {
        // set to `true` when using HTTPS
        secure: process.env.NODE_ENV === 'production',
      },
    },
    getUserAttributes: (attributes) => {
      return omit(['password'], attributes)
    },
  })

  return lucia
}
