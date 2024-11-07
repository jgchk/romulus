import { desc, eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type ApiKey, apiKeys } from '../schema'

export class ApiKeysDatabase {
  findByAccountId(accountId: ApiKey['accountId'], conn: IDrizzleConnection): Promise<ApiKey[]> {
    return conn.query.apiKeys.findMany({
      where: eq(apiKeys.accountId, accountId),
      orderBy: desc(apiKeys.createdAt),
    })
  }
}
