import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type ApiKey, apiKeys, type InsertApiKey } from '../schema'

export class ApiKeysDatabase {
  insert(data: InsertApiKey[], conn: IDrizzleConnection): Promise<ApiKey[]> {
    return conn.insert(apiKeys).values(data).returning()
  }

  findByAccountId(accountId: ApiKey['accountId'], conn: IDrizzleConnection): Promise<ApiKey[]> {
    return conn.query.apiKeys.findMany({
      where: eq(apiKeys.accountId, accountId),
    })
  }

  async deleteAll(conn: IDrizzleConnection): Promise<void> {
    await conn.delete(apiKeys)
  }
}
