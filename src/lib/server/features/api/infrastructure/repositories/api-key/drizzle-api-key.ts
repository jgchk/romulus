import type { IDrizzleConnection } from '$lib/server/db/connection'
import { apiKeys } from '$lib/server/db/schema'

import { ApiKey } from '../../../domain/entities/api-key'
import type { ApiKeyRepository } from '../../../domain/repositories/api-key'

export class DrizzleApiKeyRepository implements ApiKeyRepository {
  constructor(private db: IDrizzleConnection) {}

  async findByKeyHash(keyHash: string): Promise<ApiKey | undefined> {
    const result = await this.db.query.apiKeys.findFirst({
      where: (apiKeys, { eq }) => eq(apiKeys.keyHash, keyHash),
    })

    if (!result) return undefined

    return new ApiKey(result.name, result.accountId, result.keyHash)
  }

  async save(apiKey: ApiKey): Promise<{ id: number }> {
    const [{ id }] = await this.db
      .insert(apiKeys)
      .values({
        name: apiKey.name,
        keyHash: apiKey.keyHash,
        accountId: apiKey.accountId,
      })
      .returning({ id: apiKeys.id })
    return { id }
  }
}
