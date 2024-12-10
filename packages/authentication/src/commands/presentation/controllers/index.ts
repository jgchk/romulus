import type { RequestPasswordResetController } from './request-password-reset'
import type { ResetPasswordController } from './reset-password'

export class AuthenticationController {
  constructor(
    private requestPasswordResetController: RequestPasswordResetController,
    private resetPasswordController: ResetPasswordController,
  ) {}

  requestPasswordReset(
    userAccount: {
      id: number
    },
    accountId: number,
  ) {
    return this.requestPasswordResetController.handle(userAccount, accountId)
  }

  resetPassword(passwordResetToken: string, newPassword: string) {
    return this.resetPasswordController.handle(passwordResetToken, newPassword)
  }
}
