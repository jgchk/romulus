import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { passwordResetTokens } from '$lib/server/db/schema'

import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token'

export class DrizzlePasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private db: IDrizzleConnection) {}

  async create(token: PasswordResetToken): Promise<void> {
    await this.db.insert(passwordResetTokens).values({
      tokenHash: token.tokenHash,
      userId: token.accountId,
      expiresAt: token.expiresAt,
    })
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | undefined> {
    const entry = await this.db.query.passwordResetTokens.findFirst({
      where: (passwordResetTokens, { eq }) => eq(passwordResetTokens.tokenHash, tokenHash),
    })
    if (!entry) return

    const token = new PasswordResetToken(entry.userId, entry.tokenHash, entry.expiresAt)

    return token
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash))
  }

  async deleteByAccountId(accountId: number): Promise<void> {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, accountId))
  }
}
