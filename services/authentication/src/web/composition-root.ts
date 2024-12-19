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
  constructor(private _dbConnection: IDrizzleConnection) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  accountRepository(): AccountRepository {
    return new DrizzleAccountRepository(this.dbConnection())
  }

  sessionRepository(): SessionRepository {
    return new DrizzleSessionRepository(this.dbConnection())
  }

  passwordHashRepository(): HashRepository {
    return new BcryptHashRepository()
  }

  sessionTokenHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }

  sessionTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  passwordResetTokenRepository(): PasswordResetTokenRepository {
    return new DrizzlePasswordResetTokenRepository(this.dbConnection())
  }

  passwordResetTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  passwordResetTokenHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }
}
