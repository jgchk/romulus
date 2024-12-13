import type { IAuthorizationApplication } from '@romulus/authorization'

import type { IAuthenticationApplication } from '../application'
import { AuthenticationApplication } from '../application'
import type { AccountRepository } from '../domain/repositories/account'
import type { HashRepository } from '../domain/repositories/hash-repository'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token'
import type { SessionRepository } from '../domain/repositories/session'
import type { TokenGenerator } from '../domain/repositories/token-generator'
import { BcryptHashRepository } from '../infrastructure/bcrypt-hash-repository'
import { CryptoTokenGenerator } from '../infrastructure/crypto-token-generator'
import { DrizzleAccountRepository } from '../infrastructure/drizzle-account-repository'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import { DrizzlePasswordResetTokenRepository } from '../infrastructure/drizzle-password-reset-token-repository'
import { DrizzleSessionRepository } from '../infrastructure/drizzle-session-repository'
import { Sha256HashRepository } from '../infrastructure/sha256-hash-repository'

export class CommandsCompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _authorization: IAuthorizationApplication,
  ) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  private authorization(): IAuthorizationApplication {
    return this._authorization
  }

  application(): IAuthenticationApplication {
    return new AuthenticationApplication(
      this.accountRepository(),
      this.sessionRepository(),
      this.sessionTokenHashRepository(),
      this.passwordHashRepository(),
      this.sessionTokenGenerator(),
      this.passwordResetTokenRepository(),
      this.passwordResetTokenGenerator(),
      this.passwordResetTokenHashRepository(),
      this.authorization(),
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
}
