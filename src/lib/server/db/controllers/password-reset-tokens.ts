import { eq } from 'drizzle-orm'

import type { DbConnection } from '../connection'
import {
  type Account,
  type InsertPasswordResetToken,
  type PasswordResetToken,
  passwordResetTokens,
} from '../schema'

export interface IPasswordResetTokensDatabase {
  insert: (...data: InsertPasswordResetToken[]) => Promise<PasswordResetToken[]>
  findByTokenHash: (
    tokenHash: PasswordResetToken['tokenHash'],
  ) => Promise<PasswordResetToken | undefined>
  deleteByAccountId: (accountId: Account['id']) => Promise<void>
  deleteByTokenHash: (tokenHash: PasswordResetToken['tokenHash']) => Promise<void>
}

export class PasswordResetTokensDatabase implements IPasswordResetTokensDatabase {
  constructor(private db: DbConnection) {}

  insert(...data: InsertPasswordResetToken[]) {
    return this.db.insert(passwordResetTokens).values(data).returning()
  }

  findByTokenHash(tokenHash: PasswordResetToken['tokenHash']) {
    return this.db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, tokenHash),
    })
  }

  async deleteByAccountId(accountId: Account['id']) {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, accountId))
  }

  async deleteByTokenHash(tokenHash: PasswordResetToken['tokenHash']) {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash))
  }
}
