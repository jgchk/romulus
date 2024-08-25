import type { PasswordResetToken } from '../../domain/password-reset-token'

export type PasswordResetTokenRepository = {
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | undefined>
  deleteByTokenHash(tokenHash: string): Promise<void>
}
