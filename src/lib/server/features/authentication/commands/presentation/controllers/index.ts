import type { PasswordResetToken } from '../../domain/entities/password-reset-token'
import type { LoginController } from './login'
import type { LogoutController } from './logout'
import type { RegisterController } from './register'
import type { ResetPasswordController } from './reset-password'

export class AuthenticationController {
  constructor(
    private loginController: LoginController,
    private logoutController: LogoutController,
    private registerController: RegisterController,
    private resetPasswordController: ResetPasswordController,
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

  resetPassword(passwordResetToken: PasswordResetToken, newPassword: string) {
    return this.resetPasswordController.handle(passwordResetToken, newPassword)
  }
}
