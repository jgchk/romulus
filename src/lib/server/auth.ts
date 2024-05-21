import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import bcryptjs from 'bcryptjs'
import type { InferSelectModel } from 'drizzle-orm'
import { Lucia } from 'lucia'

import { omit } from '$lib/utils/object'

import { db } from './db'
import { accounts, sessions } from './db/schema'

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    UserId: number
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

type DatabaseUserAttributes = InferSelectModel<typeof accounts>

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, accounts)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'auth_session',
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return omit(attributes, ['password'])
  },
})

export const checkPassword = (password: string, hash: string) => bcryptjs.compare(password, hash)
export const hashPassword = (password: string): Promise<string> => bcryptjs.hash(password, 12)
