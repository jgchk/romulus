import type { ResetPasswordCommand } from '../../application/commands/reset-password'
import type { ValidatePasswordResetTokenCommand } from '../../application/commands/validate-password-reset-token'
import { AccountNotFoundError } from '../../application/errors/account-not-found'
import type { PasswordResetTokenExpiredError } from '../../application/errors/password-reset-token-expired'
import type { PasswordResetTokenNotFoundError } from '../../application/errors/password-reset-token-not-found'
import type { CookieCreator } from '../cookie'
import type { Cookie } from '../cookie'

export class ResetPasswordController {
  constructor(
    private validatePasswordResetTokenCommand: ValidatePasswordResetTokenCommand,
    private resetPasswordCommand: ResetPasswordCommand,
    private cookieCreator: CookieCreator,
  ) {}

  async handle(
    passwordResetToken: string,
    newPassword: string,
  ): Promise<
    Cookie | AccountNotFoundError | PasswordResetTokenNotFoundError | PasswordResetTokenExpiredError
  > {
    const validPasswordResetToken =
      await this.validatePasswordResetTokenCommand.execute(passwordResetToken)
    if (validPasswordResetToken instanceof Error) {
      return validPasswordResetToken
    }

    const resetPasswordResult = await this.resetPasswordCommand.execute(
      validPasswordResetToken,
      newPassword,
    )

    if (resetPasswordResult instanceof AccountNotFoundError) {
      return resetPasswordResult
    }

    return this.cookieCreator.create(resetPasswordResult.userSession)
  }
}
