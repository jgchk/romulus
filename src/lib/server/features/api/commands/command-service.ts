import type { TokenGenerator } from '../../authentication/commands/domain/repositories/token-generator'
import type { HashRepository } from '../../common/domain/repositories/hash'
import { CreateApiKeyCommand } from './application/commands/create-api-key'
import { DeleteApiKeyCommand } from './application/commands/delete-api-key'
import { ValidateApiKeyCommand } from './application/commands/validate-api-key'
import type { ApiKeyRepository } from './domain/repositories/api-key'

export class ApiCommandService {
  private createApiKeyCommand: CreateApiKeyCommand
  private deleteApiKeyCommand: DeleteApiKeyCommand
  private validateApiKeyCommand: ValidateApiKeyCommand

  constructor(
    apiKeyRepo: ApiKeyRepository,
    apiKeyTokenGenerator: TokenGenerator,
    apiKeyHashRepo: HashRepository,
  ) {
    this.createApiKeyCommand = new CreateApiKeyCommand(
      apiKeyRepo,
      apiKeyTokenGenerator,
      apiKeyHashRepo,
    )
    this.deleteApiKeyCommand = new DeleteApiKeyCommand(apiKeyRepo)
    this.validateApiKeyCommand = new ValidateApiKeyCommand(apiKeyRepo, apiKeyHashRepo)
  }

  createApiKey(name: string, accountId: number) {
    return this.createApiKeyCommand.execute(name, accountId)
  }

  deleteApiKey(id: number, accountId: number) {
    return this.deleteApiKeyCommand.execute(id, accountId)
  }

  validateApiKey(apiKey: string) {
    return this.validateApiKeyCommand.execute(apiKey)
  }
}
