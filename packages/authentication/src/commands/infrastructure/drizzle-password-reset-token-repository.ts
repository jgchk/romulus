import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../../shared/infrastructure/drizzle-database'
import { passwordResetTokensTable } from '../../shared/infrastructure/drizzle-schema'
import { PasswordResetToken } from '../domain/entities/password-reset-token'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token'

export class DrizzlePasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private db: IDrizzleConnection) {}

  async create(token: PasswordResetToken): Promise<void> {
    await this.db.insert(passwordResetTokensTable).values({
      tokenHash: token.tokenHash,
      userId: token.accountId,
      expiresAt: token.expiresAt,
    })
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | undefined> {
    const entry = await this.db.query.passwordResetTokensTable.findFirst({
      where: (passwordResetTokens, { eq }) => eq(passwordResetTokens.tokenHash, tokenHash),
    })
    if (!entry) return

    const token = new PasswordResetToken(entry.userId, entry.tokenHash, entry.expiresAt)

    return token
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, tokenHash))
  }

  async deleteByAccountId(accountId: number): Promise<void> {
    await this.db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, accountId))
  }
}
