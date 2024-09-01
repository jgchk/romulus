import type { HashRepository } from '../../common/domain/repositories/hash'
import type { ApiKeyRepository } from '../domain/repositories/api-key'
import { ValidateApiKeyCommand } from './commands/validate-api-key'

export class ApiService {
  private validateApiKeyCommand: ValidateApiKeyCommand

  constructor(apiKeyRepo: ApiKeyRepository, apiKeyHashRepo: HashRepository) {
    this.validateApiKeyCommand = new ValidateApiKeyCommand(apiKeyRepo, apiKeyHashRepo)
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    return this.validateApiKeyCommand.execute(apiKey)
  }
}
