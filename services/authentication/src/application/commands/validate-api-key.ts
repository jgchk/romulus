import type { ApiKeyRepository } from '../../domain/repositories/api-key'
import type { HashRepository } from '../../domain/repositories/hash-repository'

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
