import type { LoginController } from './login'
import type { LogoutController } from './logout'
import type { RegisterController } from './register'
import { RequestPasswordResetController } from './request-password-reset'
import type { ResetPasswordController } from './reset-password'
import type { ValidateSessionController } from './validate-session'

export class AuthenticationController {
  constructor(
    private loginController: LoginController,
    private logoutController: LogoutController,
    private registerController: RegisterController,
    private requestPasswordResetController: RequestPasswordResetController,
    private resetPasswordController: ResetPasswordController,
    private validateSessionController: ValidateSessionController,
  ) {}

  login(username: string, password: string) {
    return this.loginController.handle(username, password)
  }

  logout(sessionToken: string) {
    return this.logoutController.handle(sessionToken)
  }

  register(username: string, password: string) {
    return this.registerController.handle(username, password)
  }

  requestPasswordReset(sessionToken: string, accountId: number) {
    return this.requestPasswordResetController.handle(sessionToken, accountId)
  }

  resetPassword(passwordResetToken: string, newPassword: string) {
    return this.resetPasswordController.handle(passwordResetToken, newPassword)
  }

  validateSession(sessionToken: string) {
    return this.validateSessionController.handle(sessionToken)
  }
}
