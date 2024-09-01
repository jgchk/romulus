import type { ApiKey } from '../entities/api-key'

export type ApiKeyRepository = {
  findByKeyHash(keyHash: string): Promise<ApiKey | undefined>
}
