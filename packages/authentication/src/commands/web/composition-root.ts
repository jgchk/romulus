import { GetSessionCommand } from '../../application/commands/get-session'
import { LoginCommand } from '../../application/commands/login'
import { LogoutCommand } from '../../application/commands/logout'
import { RefreshSessionCommand } from '../../application/commands/refresh-session'
import { RegisterCommand } from '../../application/commands/register'
import { RequestPasswordResetCommand } from '../../application/commands/request-password-reset'
import { ResetPasswordCommand } from '../../application/commands/reset-password'
import type { IDrizzleConnection } from '../../shared/infrastructure/drizzle-database'
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

  loginCommand(): LoginCommand {
    return new LoginCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.passwordHashRepository(),
      this.sessionTokenHashRepository(),
      this.sessionTokenGenerator(),
    )
  }

  logoutCommand(): LogoutCommand {
    return new LogoutCommand(this.sessionRepository(), this.sessionTokenHashRepository())
  }

  refreshSessionCommand(): RefreshSessionCommand {
    return new RefreshSessionCommand(this.sessionRepository(), this.sessionTokenHashRepository())
  }

  registerCommand(): RegisterCommand {
    return new RegisterCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.passwordHashRepository(),
      this.sessionTokenHashRepository(),
      this.sessionTokenGenerator(),
    )
  }

  requestPasswordResetCommand(): RequestPasswordResetCommand {
    return new RequestPasswordResetCommand(
      this.passwordResetTokenRepository(),
      this.passwordResetTokenGenerator(),
      this.passwordResetTokenHashRepository(),
      this.accountRepository(),
    )
  }

  resetPasswordCommand(): ResetPasswordCommand {
    return new ResetPasswordCommand(
      this.accountRepository(),
      this.sessionRepository(),
      this.passwordResetTokenRepository(),
      this.passwordResetTokenHashRepository(),
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

  private passwordResetTokenRepository(): PasswordResetTokenRepository {
    return new DrizzlePasswordResetTokenRepository(this.dbConnection())
  }

  private passwordResetTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  private passwordResetTokenHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }

  cookieCreator(): CookieCreator {
    return new CookieCreator(this.sessionCookieName, IS_SECURE)
  }
}
