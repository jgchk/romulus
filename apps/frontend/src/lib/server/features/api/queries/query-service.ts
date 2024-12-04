import type { IDrizzleConnection } from '$lib/server/db/connection'

import { GetApiKeysByAccountQuery } from './application/get-api-keys-by-account'

export class ApiQueryService {
  private getApiKeysByAccountQuery: GetApiKeysByAccountQuery

  constructor(db: IDrizzleConnection) {
    this.getApiKeysByAccountQuery = new GetApiKeysByAccountQuery(db)
  }

  getApiKeysByAccount(accountId: number) {
    return this.getApiKeysByAccountQuery.execute(accountId)
  }
}
