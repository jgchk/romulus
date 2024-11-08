import type { IDrizzleConnection } from '$lib/server/db/connection'

import { GetAccountQuery } from './application/get-account'

export class AuthenticationQueryService {
  private getAccountQuery: GetAccountQuery

  constructor(db: IDrizzleConnection) {
    this.getAccountQuery = new GetAccountQuery(db)
  }

  getAccount(accountId: number) {
    return this.getAccountQuery.execute(accountId)
  }
}
