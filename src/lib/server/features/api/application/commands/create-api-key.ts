import { generateApiKey, hashApiKey } from '$lib/server/api-keys'

import { ApiKey } from '../../domain/entities/api-key'
import type { ApiKeyRepository } from '../../domain/repositories/api-key'

export type CreateApiKeyResult = {
  id: number
  name: string
  key: string
}

export class CreateApiKeyCommand {
  constructor(private apiKeyRepo: ApiKeyRepository) {}

  async execute(name: string, accountId: number): Promise<CreateApiKeyResult> {
    const key = generateApiKey()
    const keyHash = await hashApiKey(key)

    const apiKey = new ApiKey(name, accountId, keyHash)

    const { id } = await this.apiKeyRepo.save(apiKey)

    return { id, name, key }
  }
}
