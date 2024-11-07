import type { ApiKey } from '../entities/api-key'

export type ApiKeyRepository = {
  findById(id: number): Promise<ApiKey | undefined>
  findByKeyHash(keyHash: string): Promise<ApiKey | undefined>
  save(apiKey: ApiKey): Promise<{ id: number }>
  deleteById(id: number): Promise<void>
}
