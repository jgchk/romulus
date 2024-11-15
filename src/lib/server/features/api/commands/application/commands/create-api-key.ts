import type { HashRepository } from '$lib/server/features/common/domain/repositories/hash'
import type { TokenGenerator } from '$lib/server/features/common/domain/token-generator'

import { ApiKey } from '../../domain/entities/api-key'
import type { ApiKeyRepository } from '../../domain/repositories/api-key'

export type CreateApiKeyResult = {
  id: number
  name: string
  key: string
}

export class CreateApiKeyCommand {
  constructor(
    private apiKeyRepo: ApiKeyRepository,
    private apiKeyTokenGenerator: TokenGenerator,
    private apiKeyHashRepo: HashRepository,
  ) {}

  async execute(name: string, accountId: number): Promise<CreateApiKeyResult> {
    const key = this.apiKeyTokenGenerator.generate(40)

    const keyHash = await this.apiKeyHashRepo.hash(key)

    const apiKey = new ApiKey(name, accountId, keyHash)

    const { id } = await this.apiKeyRepo.save(apiKey)

    return { id, name, key }
  }
}
