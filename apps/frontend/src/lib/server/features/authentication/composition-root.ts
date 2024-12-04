import type { IDrizzleConnection } from '$lib/server/db/connection'

import type { HashRepository } from '../common/domain/repositories/hash'
import type { TokenGenerator } from '../common/domain/token-generator'
import { Sha256HashRepository } from '../common/infrastructure/repositories/hash/sha256-hash-repository'
import { CryptoTokenGenerator } from '../common/infrastructure/token/crypto-token-generator'
import { LoginCommand } from './commands/application/commands/login'
import { LogoutCommand } from './commands/application/commands/logout'
import { RegisterCommand } from './commands/application/commands/register'
import { RequestPasswordResetCommand } from './commands/application/commands/request-password-reset'
import { ResetPasswordCommand } from './commands/application/commands/reset-password'
import { UpdateUserSettingsCommand } from './commands/application/commands/update-user-settings'
import { ValidatePasswordResetTokenCommand } from './commands/application/commands/validate-password-reset-token'
import { ValidateSessionCommand } from './commands/application/commands/validate-session'
import { AuthenticationCommandService } from './commands/command-service'
import type { AccountRepository } from './commands/domain/repositories/account'
import type { PasswordResetTokenRepository } from './commands/domain/repositories/password-reset-token'
import type { SessionRepository } from './commands/domain/repositories/session'
import { DrizzleAccountRepository } from './commands/infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from './commands/infrastructure/hash/bcrypt-hash-repository'
import { DrizzlePasswordResetTokenRepository } from './commands/infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { DrizzleSessionRepository } from './commands/infrastructure/session/drizzle-session-repository'
import { AuthenticationController } from './commands/presentation/controllers'
import { LoginController } from './commands/presentation/controllers/login'
import { LogoutController } from './commands/presentation/controllers/logout'
import { RegisterController } from './commands/presentation/controllers/register'
import { ResetPasswordController } from './commands/presentation/controllers/reset-password'
import { ValidateSessionController } from './commands/presentation/controllers/validate-session'
import { CookieCreator } from './commands/presentation/cookie'
import { AuthenticationQueryService } from './queries/query-service'

const IS_SECURE = process.env.NODE_ENV === 'production'

export class AuthenticationCompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _sessionCookieName: string,
  ) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  authenticationCommandService(): AuthenticationCommandService {
    return new AuthenticationCommandService(
      this.loginCommand(),
      this.logoutCommand(),
      this.registerCommand(),
      this.requestPasswordResetCommand(),
      this.resetPasswordCommand(),
      this.updateUserSettingsCommand(),
      this.validatePasswordResetTokenCommand(),
      this.validateSessionCommand(),
    )
  }

  authenticationQueryService(): AuthenticationQueryService {
    return new AuthenticationQueryService(this.dbConnection())
  }

  authenticationController() {
    return new AuthenticationController(
      this.loginController(),
      this.logoutController(),
      this.registerController(),
      this.resetPasswordController(),
      this.validateSessionController(),
    )
  }

  private loginCommand(): LoginCommand {
    return new LoginCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.passwordHashRepository(),
      this.sessionTokenHashRepository(),
      this.sessionTokenGenerator(),
    )
  }

  private accountRepository(): AccountRepository {
    return new DrizzleAccountRepository(this.dbConnection())
  }

  private sessionRepository(): SessionRepository {
    return new DrizzleSessionRepository(this.dbConnection())
  }

  private passwordHashRepository(): HashRepository {
    return new BcryptHashRepository()
  }

  private sessionTokenHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }

  private sessionTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  private logoutCommand(): LogoutCommand {
    return new LogoutCommand(this.sessionRepository(), this.sessionTokenHashRepository())
  }

  private registerCommand(): RegisterCommand {
    return new RegisterCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.passwordHashRepository(),
      this.sessionTokenHashRepository(),
      this.sessionTokenGenerator(),
    )
  }

  private requestPasswordResetCommand(): RequestPasswordResetCommand {
    return new RequestPasswordResetCommand(
      this.passwordResetTokenRepository(),
      this.passwordResetTokenGenerator(),
      this.passwordResetTokenHashRepository(),
    )
  }

  private passwordResetTokenRepository(): PasswordResetTokenRepository {
    return new DrizzlePasswordResetTokenRepository(this.dbConnection())
  }

  private passwordResetTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  private passwordResetTokenHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }

  private resetPasswordCommand(): ResetPasswordCommand {
    return new ResetPasswordCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.passwordResetTokenRepository(),
      this.passwordHashRepository(),
      this.sessionTokenHashRepository(),
      this.sessionTokenGenerator(),
    )
  }

  private updateUserSettingsCommand(): UpdateUserSettingsCommand {
    return new UpdateUserSettingsCommand(this.accountRepository())
  }

  private validatePasswordResetTokenCommand(): ValidatePasswordResetTokenCommand {
    return new ValidatePasswordResetTokenCommand(
      this.passwordResetTokenRepository(),
      this.passwordResetTokenHashRepository(),
    )
  }

  private validateSessionCommand(): ValidateSessionCommand {
    return new ValidateSessionCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.sessionTokenHashRepository(),
    )
  }

  private loginController(): LoginController {
    return new LoginController(this.loginCommand(), this.cookieCreator())
  }

  private logoutController(): LogoutController {
    return new LogoutController(this.logoutCommand(), this.cookieCreator())
  }

  private registerController(): RegisterController {
    return new RegisterController(this.registerCommand(), this.cookieCreator())
  }

  private resetPasswordController(): ResetPasswordController {
    return new ResetPasswordController(this.resetPasswordCommand(), this.cookieCreator())
  }

  private validateSessionController(): ValidateSessionController {
    return new ValidateSessionController(this.validateSessionCommand(), this.cookieCreator())
  }

  private cookieCreator(): CookieCreator {
    return new CookieCreator(this._sessionCookieName, IS_SECURE)
  }
}
