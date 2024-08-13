import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import {
  type Account,
  type InsertPasswordResetToken,
  type PasswordResetToken,
  passwordResetTokens,
} from '../schema'

export type IPasswordResetTokensDatabase<T> = {
  insert(data: InsertPasswordResetToken[], conn: T): Promise<PasswordResetToken[]>
  findByTokenHash(
    tokenHash: PasswordResetToken['tokenHash'],
    conn: T,
  ): Promise<PasswordResetToken | undefined>
  deleteByAccountId(accountId: Account['id'], conn: T): Promise<void>
  deleteByTokenHash(tokenHash: PasswordResetToken['tokenHash'], conn: T): Promise<void>
}

export class PasswordResetTokensDatabase
  implements IPasswordResetTokensDatabase<IDrizzleConnection>
{
  insert(data: InsertPasswordResetToken[], conn: IDrizzleConnection) {
    return conn.insert(passwordResetTokens).values(data).returning()
  }

  findByTokenHash(tokenHash: PasswordResetToken['tokenHash'], conn: IDrizzleConnection) {
    return conn.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, tokenHash),
    })
  }

  async deleteByAccountId(accountId: Account['id'], conn: IDrizzleConnection) {
    await conn.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, accountId))
  }

  async deleteByTokenHash(tokenHash: PasswordResetToken['tokenHash'], conn: IDrizzleConnection) {
    await conn.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash))
  }
}
