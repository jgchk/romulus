import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { passwordResetTokens } from '$lib/server/db/schema'

import { PasswordResetToken } from '../../domain/password-reset-token'
import type { PasswordResetTokenRepository } from './password-reset-token-repository'

export class DrizzlePasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private db: IDrizzleConnection) {}

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
}
