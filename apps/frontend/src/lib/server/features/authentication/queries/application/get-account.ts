import type { IDrizzleConnection } from '$lib/server/db/connection'

export type GetAccountResult = {
  id: number
  username: string
}

export class GetAccountQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(accountId: number): Promise<GetAccountResult | undefined> {
    return this.db.query.accounts.findFirst({
      columns: { id: true, username: true },
      where: (accounts, { eq }) => eq(accounts.id, accountId),
    })
  }
}
