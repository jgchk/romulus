import type { ResetPasswordController } from './reset-password'

export class AuthenticationController {
  constructor(private resetPasswordController: ResetPasswordController) {}

  resetPassword(passwordResetToken: string, newPassword: string) {
    return this.resetPasswordController.handle(passwordResetToken, newPassword)
  }
}
