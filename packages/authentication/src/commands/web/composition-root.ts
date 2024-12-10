import type { IDrizzleConnection } from '../../shared/infrastructure/drizzle-database'
import { GetSessionCommand } from '../application/commands/get-session'
import { LoginCommand } from '../application/commands/login'
import { LogoutCommand } from '../application/commands/logout'
import { RefreshSessionCommand } from '../application/commands/refresh-session'
import { RegisterCommand } from '../application/commands/register'
import { RequestPasswordResetCommand } from '../application/commands/request-password-reset'
import { ResetPasswordCommand } from '../application/commands/reset-password'
import { ValidatePasswordResetTokenCommand } from '../application/commands/validate-password-reset-token'
import type { AccountRepository } from '../domain/repositories/account'
import type { HashRepository } from '../domain/repositories/hash-repository'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token'
import type { SessionRepository } from '../domain/repositories/session'
import type { TokenGenerator } from '../domain/repositories/token-generator'
import { BcryptHashRepository } from '../infrastructure/bcrypt-hash-repository'
import { CryptoTokenGenerator } from '../infrastructure/crypto-token-generator'
import { DrizzleAccountRepository } from '../infrastructure/drizzle-account-repository'
import { DrizzlePasswordResetTokenRepository } from '../infrastructure/drizzle-password-reset-token-repository'
import { DrizzleSessionRepository } from '../infrastructure/drizzle-session-repository'
import { Sha256HashRepository } from '../infrastructure/sha256-hash-repository'
import { AuthenticationController } from '../presentation/controllers'
import { LoginController } from '../presentation/controllers/login'
import { LogoutController } from '../presentation/controllers/logout'
import { RegisterController } from '../presentation/controllers/register'
import { RequestPasswordResetController } from '../presentation/controllers/request-password-reset'
import { ResetPasswordController } from '../presentation/controllers/reset-password'
import { CookieCreator } from '../presentation/cookie'

const IS_SECURE = process.env.NODE_ENV === 'production'

export class CommandsCompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    public readonly sessionCookieName: string,
  ) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  getSessionCommand(): GetSessionCommand {
    return new GetSessionCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.sessionTokenHashRepository(),
    )
  }

  controller() {
    return new AuthenticationController(
      this.loginController(),
      this.logoutController(),
      this.registerController(),
      this.requestPasswordResetController(),
      this.resetPasswordController(),
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

  private passwordResetTokenRepository(): PasswordResetTokenRepository {
    return new DrizzlePasswordResetTokenRepository(this.dbConnection())
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

  refreshSessionCommand(): RefreshSessionCommand {
    return new RefreshSessionCommand(this.sessionRepository(), this.sessionTokenHashRepository())
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

  private requestPasswordResetController(): RequestPasswordResetController {
    return new RequestPasswordResetController(this.requestPasswordResetCommand())
  }

  private requestPasswordResetCommand(): RequestPasswordResetCommand {
    return new RequestPasswordResetCommand(
      this.passwordResetTokenRepository(),
      this.passwordResetTokenGenerator(),
      this.passwordResetTokenHashRepository(),
      this.accountRepository(),
    )
  }

  private passwordResetTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  private resetPasswordController(): ResetPasswordController {
    return new ResetPasswordController(
      this.validatePasswordResetTokenCommand(),
      this.resetPasswordCommand(),
      this.cookieCreator(),
    )
  }

  private validatePasswordResetTokenCommand(): ValidatePasswordResetTokenCommand {
    return new ValidatePasswordResetTokenCommand(
      this.passwordResetTokenRepository(),
      this.passwordResetTokenHashRepository(),
    )
  }

  private passwordResetTokenHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }

  cookieCreator(): CookieCreator {
    return new CookieCreator(this.sessionCookieName, IS_SECURE)
  }
}
