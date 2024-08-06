import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type ApiKey, apiKeys, type InsertApiKey } from '../schema'

export class ApiKeysDatabase {
  insert(data: InsertApiKey[], conn: IDrizzleConnection): Promise<ApiKey[]> {
    return conn.insert(apiKeys).values(data).returning()
  }

  findById(id: ApiKey['id'], conn: IDrizzleConnection): Promise<ApiKey | undefined> {
    return conn.query.apiKeys.findFirst({
      where: eq(apiKeys.id, id),
    })
  }

  findByAccountId(accountId: ApiKey['accountId'], conn: IDrizzleConnection): Promise<ApiKey[]> {
    return conn.query.apiKeys.findMany({
      where: eq(apiKeys.accountId, accountId),
    })
  }

  async deleteById(id: ApiKey['id'], conn: IDrizzleConnection): Promise<void> {
    await conn.delete(apiKeys).where(eq(apiKeys.id, id))
  }

  async deleteAll(conn: IDrizzleConnection): Promise<void> {
    await conn.delete(apiKeys)
  }
}
