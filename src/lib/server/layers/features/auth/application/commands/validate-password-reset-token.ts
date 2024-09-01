import type { PasswordResetToken } from '../../domain/entities/password-reset-token'
import type { HashRepository } from '../../domain/repositories/hash'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token'
import { PasswordResetTokenExpiredError } from '../errors/password-reset-token-expired'
import { PasswordResetTokenNotFoundError } from '../errors/password-reset-token-not-found'

export class ValidatePasswordResetTokenCommand {
  constructor(
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private passwordResetTokenHashRepo: HashRepository,
  ) {}

  async execute(
    verificationToken: string,
  ): Promise<
    PasswordResetToken | PasswordResetTokenNotFoundError | PasswordResetTokenExpiredError
  > {
    const tokenHash = await this.passwordResetTokenHashRepo.hash(verificationToken)
    const token = await this.passwordResetTokenRepo.findByTokenHash(tokenHash)

    if (!token) {
      return new PasswordResetTokenNotFoundError()
    }

    if (token.isExpired()) {
      return new PasswordResetTokenExpiredError()
    }

    return token
  }
}
