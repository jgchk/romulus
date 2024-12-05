import type { IDrizzleConnection } from '../../shared/infrastructure/drizzle-database'

export type GetAccountResult = {
  id: number
  username: string
}

export class GetAccountQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(accountId: number): Promise<GetAccountResult | undefined> {
    return this.db.query.accountsTable.findFirst({
      columns: { id: true, username: true },
      where: (accounts, { eq }) => eq(accounts.id, accountId),
    })
  }
}
