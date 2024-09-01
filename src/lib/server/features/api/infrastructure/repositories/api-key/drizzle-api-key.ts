import type { IDrizzleConnection } from '$lib/server/db/connection'

import type { ApiKey } from '../../../domain/entities/api-key'
import type { ApiKeyRepository } from '../../../domain/repositories/api-key'

export class DrizzleApiKeyRepository implements ApiKeyRepository {
  constructor(private db: IDrizzleConnection) {}

  findByKeyHash(keyHash: string): Promise<ApiKey | undefined> {
    return this.db.query.apiKeys.findFirst({
      where: (apiKeys, { eq }) => eq(apiKeys.keyHash, keyHash),
    })
  }
}
