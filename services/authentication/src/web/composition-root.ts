import type { AccountRepository } from '../domain/repositories/account.js'
import type { ApiKeyRepository } from '../domain/repositories/api-key.js'
import type { HashRepository } from '../domain/repositories/hash-repository.js'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token.js'
import type { SessionRepository } from '../domain/repositories/session.js'
import type { TokenGenerator } from '../domain/repositories/token-generator.js'
import { BcryptHashRepository } from '../infrastructure/bcrypt-hash-repository.js'
import { CryptoTokenGenerator } from '../infrastructure/crypto-token-generator.js'
import { DrizzleAccountRepository } from '../infrastructure/drizzle-account-repository.js'
import { DrizzleApiKeyRepository } from '../infrastructure/drizzle-api-key-repository.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { DrizzlePasswordResetTokenRepository } from '../infrastructure/drizzle-password-reset-token-repository.js'
import { DrizzleSessionRepository } from '../infrastructure/drizzle-session-repository.js'
import { Sha256HashRepository } from '../infrastructure/sha256-hash-repository.js'

export class CommandsCompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

  dbConnection(): IDrizzleConnection {
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

  apiKeyRepository(): ApiKeyRepository {
    return new DrizzleApiKeyRepository(this.dbConnection())
  }

  apiKeyTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  apiKeyHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }
}
