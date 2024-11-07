import type { HashRepository } from '../../common/domain/repositories/hash'
import type { ApiKeyRepository } from '../domain/repositories/api-key'
import { CreateApiKeyCommand } from './commands/create-api-key'
import { ValidateApiKeyCommand } from './commands/validate-api-key'

export class ApiService {
  private createApiKeyCommand: CreateApiKeyCommand
  private validateApiKeyCommand: ValidateApiKeyCommand

  constructor(apiKeyRepo: ApiKeyRepository, apiKeyHashRepo: HashRepository) {
    this.createApiKeyCommand = new CreateApiKeyCommand(apiKeyRepo)
    this.validateApiKeyCommand = new ValidateApiKeyCommand(apiKeyRepo, apiKeyHashRepo)
  }

  createApiKey(name: string, accountId: number) {
    return this.createApiKeyCommand.execute(name, accountId)
  }

  validateApiKey(apiKey: string) {
    return this.validateApiKeyCommand.execute(apiKey)
  }
}
