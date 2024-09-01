import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import bcryptjs from 'bcryptjs'
import { type InferSelectModel } from 'drizzle-orm'
import type { PgDatabase } from 'drizzle-orm/pg-core'
import { generateIdFromEntropySize, Lucia } from 'lucia'
import { createDate, TimeSpan } from 'oslo'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'

import { omit } from '$lib/utils/object'

import { hashApiKey } from './api-keys'
import type { IDrizzleConnection } from './db/connection'
import { ApiKeysDatabase } from './db/controllers/api-keys'
import { PasswordResetTokensDatabase } from './db/controllers/password-reset-tokens'
import { accounts, sessions } from './db/schema'

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
      return omit(attributes, ['password'])
    },
  })

  return lucia
}

export const checkPassword = (password: string, hash: string) => bcryptjs.compare(password, hash)
export const hashPassword = (password: string): Promise<string> => bcryptjs.hash(password, 12)

export async function createPasswordResetToken(
  accountId: number,
  dbConnection: IDrizzleConnection,
): Promise<string> {
  const passwordResetTokensDb = new PasswordResetTokensDatabase()

  await passwordResetTokensDb.deleteByAccountId(accountId, dbConnection)

  const tokenId = generateIdFromEntropySize(25) // 40 character
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)))
  await passwordResetTokensDb.insert(
    [
      {
        tokenHash,
        userId: accountId,
        expiresAt: createDate(new TimeSpan(2, 'h')),
      },
    ],
    dbConnection,
  )
  return tokenId
}

export async function checkApiAuth(
  request: Request,
  locals: Pick<App.Locals, 'user' | 'dbConnection'>,
): Promise<boolean> {
  if (locals.user) {
    return true
  }

  const key = getKeyFromHeaders(request)
  if (key === null) {
    return false
  }

  const keyHash = await hashApiKey(key)
  const apiKeysDb = new ApiKeysDatabase()
  const maybeExistingKey = await apiKeysDb.findByKeyHash(keyHash, locals.dbConnection)
  return maybeExistingKey !== undefined
}

function getKeyFromHeaders(request: Request) {
  const bearer = request.headers.get('authorization')
  if (!bearer) return null

  const match = /^Bearer (.+)$/.exec(bearer)
  if (!match) return null

  return match[1]
}
