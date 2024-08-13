import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import {
  type Account,
  type InsertPasswordResetToken,
  type PasswordResetToken,
  passwordResetTokens,
} from '../schema'

export class PasswordResetTokensDatabase {
  insert(
    data: InsertPasswordResetToken[],
    conn: IDrizzleConnection,
  ): Promise<PasswordResetToken[]> {
    return conn.insert(passwordResetTokens).values(data).returning()
  }

  findByTokenHash(
    tokenHash: PasswordResetToken['tokenHash'],
    conn: IDrizzleConnection,
  ): Promise<PasswordResetToken | undefined> {
    return conn.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, tokenHash),
    })
  }

  async deleteByAccountId(accountId: Account['id'], conn: IDrizzleConnection): Promise<void> {
    await conn.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, accountId))
  }

  async deleteByTokenHash(
    tokenHash: PasswordResetToken['tokenHash'],
    conn: IDrizzleConnection,
  ): Promise<void> {
    await conn.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash))
  }
}
