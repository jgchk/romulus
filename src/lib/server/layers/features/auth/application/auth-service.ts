import type { CreatedAccount } from '../domain/entities/account'
import type { Cookie } from '../domain/entities/cookie'
import type { PasswordResetToken } from '../domain/entities/password-reset-token'
import type { CreatedSession } from '../domain/entities/session'
import type { AccountRepository } from '../domain/repositories/account'
import type { HashRepository } from '../domain/repositories/hash'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token'
import type { SessionRepository } from '../domain/repositories/session'
import { LoginCommand } from './commands/login'
import { LogoutCommand } from './commands/logout'
import { RegisterCommand } from './commands/register'
import { ResetPasswordCommand } from './commands/reset-password'
import { ValidatePasswordResetTokenCommand } from './commands/validate-password-reset-token'
import { ValidateSessionCommand } from './commands/validate-session'
import type { AccountNotFoundError } from './errors/account-not-found'
import type { InvalidLoginError } from './errors/invalid-login'
import type { NonUniqueUsernameError } from './errors/non-unique-username'
import type { PasswordResetTokenExpiredError } from './errors/password-reset-token-expired'
import type { PasswordResetTokenNotFoundError } from './errors/password-reset-token-not-found'

export class AuthService {
  registerCommand: RegisterCommand
  loginCommand: LoginCommand
  logoutCommand: LogoutCommand
  validateSessionCommand: ValidateSessionCommand
  validatePasswordResetTokenCommand: ValidatePasswordResetTokenCommand
  resetPasswordCommand: ResetPasswordCommand

  constructor(
    accountRepo: AccountRepository,
    sessionRepo: SessionRepository,
    passwordResetTokenRepo: PasswordResetTokenRepository,
    passwordHashRepo: HashRepository,
    passwordResetTokenHashRepo: HashRepository,
  ) {
    this.registerCommand = new RegisterCommand(accountRepo, sessionRepo, passwordHashRepo)
    this.loginCommand = new LoginCommand(accountRepo, sessionRepo, passwordHashRepo)
    this.logoutCommand = new LogoutCommand(sessionRepo)
    this.validateSessionCommand = new ValidateSessionCommand(accountRepo, sessionRepo)
    this.validatePasswordResetTokenCommand = new ValidatePasswordResetTokenCommand(
      passwordResetTokenRepo,
      passwordResetTokenHashRepo,
    )
    this.resetPasswordCommand = new ResetPasswordCommand(
      accountRepo,
      sessionRepo,
      passwordResetTokenRepo,
      passwordHashRepo,
    )
  }

  register(username: string, password: string): Promise<Cookie | NonUniqueUsernameError> {
    return this.registerCommand.execute(username, password)
  }

  login(username: string, password: string): Promise<Cookie | InvalidLoginError> {
    return this.loginCommand.execute(username, password)
  }

  logout(sessionId: string): Promise<Cookie> {
    return this.logoutCommand.execute(sessionId)
  }

  validateSession(sessionId: string | undefined): Promise<{
    account: CreatedAccount | undefined
    session: CreatedSession | undefined
    cookie: Cookie | undefined
  }> {
    return this.validateSessionCommand.execute(sessionId)
  }

  checkPasswordResetToken(
    verificationToken: string,
  ): Promise<
    PasswordResetToken | PasswordResetTokenNotFoundError | PasswordResetTokenExpiredError
  > {
    return this.validatePasswordResetTokenCommand.execute(verificationToken)
  }

  resetPassword(
    passwordResetToken: PasswordResetToken,
    newPassword: string,
  ): Promise<Cookie | AccountNotFoundError> {
    return this.resetPasswordCommand.execute(passwordResetToken, newPassword)
  }
}
