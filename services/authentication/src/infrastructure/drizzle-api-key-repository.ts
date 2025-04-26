import { eq } from 'drizzle-orm'

import { ApiKey } from '../domain/entities/api-key.js'
import type { ApiKeyRepository } from '../domain/repositories/api-key.js'
import type { IDrizzleConnection } from './drizzle-database.js'
import { apiKeysTable } from './drizzle-schema.js'

export class DrizzleApiKeyRepository implements ApiKeyRepository {
  constructor(private db: IDrizzleConnection) {}

  async findById(id: number): Promise<ApiKey | undefined> {
    const result = await this.db.query.apiKeysTable.findFirst({
      where: (apiKeys, { eq }) => eq(apiKeys.id, id),
    })

    if (!result) return undefined

    return new ApiKey(result.name, result.accountId, result.keyHash)
  }

  async findByKeyHash(keyHash: string): Promise<ApiKey | undefined> {
    const result = await this.db.query.apiKeysTable.findFirst({
      where: (apiKeys, { eq }) => eq(apiKeys.keyHash, keyHash),
    })

    if (!result) return undefined

    return new ApiKey(result.name, result.accountId, result.keyHash)
  }

  async save(apiKey: ApiKey): Promise<{ id: number }> {
    const results = await this.db
      .insert(apiKeysTable)
      .values({
        name: apiKey.name,
        keyHash: apiKey.keyHash,
        accountId: apiKey.accountId,
      })
      .returning({ id: apiKeysTable.id })
    const id = results[0]!.id
    return { id }
  }

  async deleteById(id: number): Promise<void> {
    await this.db.delete(apiKeysTable).where(eq(apiKeysTable.id, id))
  }
}
