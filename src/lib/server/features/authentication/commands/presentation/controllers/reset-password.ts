import type { ResetPasswordCommand } from '../../application/commands/reset-password'
import { AccountNotFoundError } from '../../application/errors/account-not-found'
import type { PasswordResetToken } from '../../domain/entities/password-reset-token'
import type { CookieCreator } from '../cookie'
import type { Cookie } from '../cookie'

export class ResetPasswordController {
  constructor(
    private resetPasswordCommand: ResetPasswordCommand,
    private cookieCreator: CookieCreator,
  ) {}

  async handle(
    passwordResetToken: PasswordResetToken,
    newPassword: string,
  ): Promise<Cookie | AccountNotFoundError> {
    const resetPasswordResult = await this.resetPasswordCommand.execute(
      passwordResetToken,
      newPassword,
    )

    if (resetPasswordResult instanceof AccountNotFoundError) {
      return resetPasswordResult
    }

    return this.cookieCreator.create(resetPasswordResult.userSession)
  }
}
