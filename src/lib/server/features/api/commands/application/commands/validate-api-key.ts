import type { HashRepository } from '../../../../common/domain/repositories/hash'
import type { ApiKeyRepository } from '../../domain/repositories/api-key'

export class ValidateApiKeyCommand {
  constructor(
    private apiKeyRepo: ApiKeyRepository,
    private apiKeyHashRepo: HashRepository,
  ) {}

  async execute(apiKey: string): Promise<boolean> {
    const keyHash = await this.apiKeyHashRepo.hash(apiKey)

    const maybeExistingKey = await this.apiKeyRepo.findByKeyHash(keyHash)
    return maybeExistingKey !== undefined
  }
}
