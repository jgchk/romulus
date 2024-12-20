import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'

export type GetApiKeysByAccountResult = {
  id: number
  name: string
  createdAt: Date
}[]

export class GetApiKeysByAccountQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(accountId: number): Promise<GetApiKeysByAccountResult> {
    return this.db.query.apiKeysTable.findMany({
      columns: {
        id: true,
        name: true,
        createdAt: true,
      },
      where: (apiKeys, { eq }) => eq(apiKeys.accountId, accountId),
      orderBy: (apiKeys, { desc }) => desc(apiKeys.createdAt),
    })
  }
}
