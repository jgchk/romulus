import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import bcryptjs from 'bcryptjs'
import { type InferSelectModel } from 'drizzle-orm'
import { generateIdFromEntropySize, Lucia } from 'lucia'
import { createDate, TimeSpan } from 'oslo'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'
import { z } from 'zod'

import { omit } from '$lib/utils/object'

import { db } from './db'
import type { IPasswordResetTokensDatabase } from './db/controllers/password-reset-tokens'
import { accounts, sessions } from './db/schema'

export const passwordSchema = z
  .object({
    password: z.string().min(8).max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    UserId: number
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

type DatabaseUserAttributes = InferSelectModel<typeof accounts>

const adapter = new DrizzlePostgreSQLAdapter(db.db, sessions, accounts)

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

export async function createPasswordResetToken(
  accountId: number,
  passwordResetTokensDb: IPasswordResetTokensDatabase,
): Promise<string> {
  await passwordResetTokensDb.deleteByAccountId(accountId)

  const tokenId = generateIdFromEntropySize(25) // 40 character
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)))
  await passwordResetTokensDb.insert({
    tokenHash: tokenHash,
    userId: accountId,
    expiresAt: createDate(new TimeSpan(2, 'h')),
  })
  return tokenId
}
