import type { Sql } from 'postgres'

import type { AccountRepository } from '../domain/repositories/account'
import type { ApiKeyRepository } from '../domain/repositories/api-key'
import type { HashRepository } from '../domain/repositories/hash-repository'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token'
import type { SessionRepository } from '../domain/repositories/session'
import type { TokenGenerator } from '../domain/repositories/token-generator'
import { BcryptHashRepository } from './bcrypt-hash-repository'
import { CryptoTokenGenerator } from './crypto-token-generator'
import { DrizzleAccountRepository } from './drizzle-account-repository'
import { DrizzleApiKeyRepository } from './drizzle-api-key-repository'
import type { IDrizzleConnection } from './drizzle-database'
import { DrizzlePasswordResetTokenRepository } from './drizzle-password-reset-token-repository'
import { getDbConnection, getPostgresConnection } from './drizzle-postgres-connection'
import { DrizzleSessionRepository } from './drizzle-session-repository'
import { Sha256HashRepository } from './sha256-hash-repository'

export class AuthenticationInfrastructure {
  private pg: Sql

  constructor(private databaseUrl: string) {
    this.pg = getPostgresConnection(this.databaseUrl)
  }

  dbConnection(): IDrizzleConnection {
    return getDbConnection(this.pg)
  }

  apiKeyRepo(): ApiKeyRepository {
    return new DrizzleApiKeyRepository(this.dbConnection())
  }

  apiKeyTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  apiKeyHashRepo(): HashRepository {
    return new Sha256HashRepository()
  }

  accountRepo(): AccountRepository {
    return new DrizzleAccountRepository(this.dbConnection())
  }

  sessionRepo(): SessionRepository {
    return new DrizzleSessionRepository(this.dbConnection())
  }

  passwordHashRepo(): HashRepository {
    return new BcryptHashRepository()
  }

  sessionTokenHashRepo(): HashRepository {
    return new Sha256HashRepository()
  }

  sessionTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  passwordResetTokenRepo(): PasswordResetTokenRepository {
    return new DrizzlePasswordResetTokenRepository(this.dbConnection())
  }

  passwordResetTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  passwordResetTokenHashRepo(): HashRepository {
    return new Sha256HashRepository()
  }
}
