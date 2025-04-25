import { type PasswordResetToken } from '../entities/password-reset-token.js'

export type PasswordResetTokenRepository = {
  create(token: PasswordResetToken): Promise<void>
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | undefined>
  deleteByTokenHash(tokenHash: string): Promise<void>
  deleteByAccountId(accountId: number): Promise<void>
}
