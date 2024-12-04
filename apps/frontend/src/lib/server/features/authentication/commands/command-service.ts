import type { LoginCommand } from './application/commands/login'
import type { LogoutCommand } from './application/commands/logout'
import type { RegisterCommand } from './application/commands/register'
import type { RequestPasswordResetCommand } from './application/commands/request-password-reset'
import type { ResetPasswordCommand } from './application/commands/reset-password'
import type { UpdateUserSettingsCommand } from './application/commands/update-user-settings'
import type { UpdateUserSettingsInput } from './application/commands/update-user-settings'
import type { ValidatePasswordResetTokenCommand } from './application/commands/validate-password-reset-token'
import type { ValidateSessionCommand } from './application/commands/validate-session'
import type { PasswordResetToken } from './domain/entities/password-reset-token'

export class AuthenticationCommandService {
  constructor(
    private loginCommand: LoginCommand,
    private logoutCommand: LogoutCommand,
    private registerCommand: RegisterCommand,
    private requestPasswordResetCommand: RequestPasswordResetCommand,
    private resetPasswordCommand: ResetPasswordCommand,
    private updateUserSettingsCommand: UpdateUserSettingsCommand,
    private validatePasswordResetTokenCommand: ValidatePasswordResetTokenCommand,
    private validateSessionCommand: ValidateSessionCommand,
  ) {}

  login(username: string, password: string) {
    return this.loginCommand.execute(username, password)
  }

  logout(sessionToken: string) {
    return this.logoutCommand.execute(sessionToken)
  }

  register(username: string, password: string) {
    return this.registerCommand.execute(username, password)
  }

  requestPasswordReset(accountId: number) {
    return this.requestPasswordResetCommand.execute(accountId)
  }

  resetPassword(passwordResetToken: PasswordResetToken, newPassword: string) {
    return this.resetPasswordCommand.execute(passwordResetToken, newPassword)
  }

  updateUserSettings(accountId: number, settings: UpdateUserSettingsInput) {
    return this.updateUserSettingsCommand.execute(accountId, settings)
  }

  validatePasswordResetToken(verificationToken: string) {
    return this.validatePasswordResetTokenCommand.execute(verificationToken)
  }

  validateSession(sessionToken: string) {
    return this.validateSessionCommand.execute(sessionToken)
  }
}
