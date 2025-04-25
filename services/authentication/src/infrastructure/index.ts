import { type Sql } from 'postgres'

import { type AccountRepository } from '../domain/repositories/account.js'
import { type ApiKeyRepository } from '../domain/repositories/api-key.js'
import { type HashRepository } from '../domain/repositories/hash-repository.js'
import { type PasswordResetTokenRepository } from '../domain/repositories/password-reset-token.js'
import { type SessionRepository } from '../domain/repositories/session.js'
import { type TokenGenerator } from '../domain/repositories/token-generator.js'
import { BcryptHashRepository } from './bcrypt-hash-repository.js'
import { CryptoTokenGenerator } from './crypto-token-generator.js'
import { DrizzleAccountRepository } from './drizzle-account-repository.js'
import { DrizzleApiKeyRepository } from './drizzle-api-key-repository.js'
import { type IDrizzleConnection } from './drizzle-database.js'
import { DrizzlePasswordResetTokenRepository } from './drizzle-password-reset-token-repository.js'
import { getDbConnection, getPostgresConnection, migrate } from './drizzle-postgres-connection.js'
import { DrizzleSessionRepository } from './drizzle-session-repository.js'
import { Sha256HashRepository } from './sha256-hash-repository.js'

export * as pglite from './drizzle-pglite-connection.js'
export * as pg from './drizzle-postgres-connection.js'

export class AuthenticationInfrastructure {
  private constructor(
    private pg: Sql,
    private db: IDrizzleConnection,
  ) {}

  static async create(databaseUrl: string): Promise<AuthenticationInfrastructure> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)

    await migrate(db)

    return new AuthenticationInfrastructure(pg, db)
  }

  async destroy(): Promise<void> {
    await this.pg.end()
  }

  dbConnection(): IDrizzleConnection {
    return this.db
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
