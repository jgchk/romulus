import type { IDrizzleConnection } from '$lib/server/db/connection'

import type { HashRepository } from '../common/domain/repositories/hash'
import type { TokenGenerator } from '../common/domain/token-generator'
import { Sha256HashRepository } from '../common/infrastructure/repositories/hash/sha256-hash-repository'
import { CryptoTokenGenerator } from '../common/infrastructure/token/crypto-token-generator'
import { ApiCommandService } from './commands/command-service'
import type { ApiKeyRepository } from './commands/domain/repositories/api-key'
import { DrizzleApiKeyRepository } from './commands/infrastructure/repositories/api-key/drizzle-api-key'
import { ApiQueryService } from './queries/query-service'

export class ApiCompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

  apiCommandService(): ApiCommandService {
    return new ApiCommandService(
      this.apiKeyRepository(),
      this.apiKeyTokenGenerator(),
      this.apiKeyHashRepository(),
    )
  }

  apiQueryService(): ApiQueryService {
    return new ApiQueryService(this.dbConnection())
  }

  private apiKeyRepository(): ApiKeyRepository {
    return new DrizzleApiKeyRepository(this.dbConnection())
  }

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  private apiKeyTokenGenerator(): TokenGenerator {
    return new CryptoTokenGenerator()
  }

  private apiKeyHashRepository(): HashRepository {
    return new Sha256HashRepository()
  }
}
