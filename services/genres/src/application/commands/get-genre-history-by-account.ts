import { desc, eq } from 'drizzle-orm'

import { type IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { genreHistory } from '../../infrastructure/drizzle-schema.js'

export type GetGenreHistoryByAccountResult = {
  id: number
  name: string
  type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  subtitle: string | null
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  createdAt: Date
  treeGenreId: number
  nsfw: boolean
}[]

export class GetGenreHistoryByAccountQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(accountId: number): Promise<GetGenreHistoryByAccountResult> {
    return this.db.query.genreHistory.findMany({
      where: eq(genreHistory.accountId, accountId),
      columns: {
        id: true,
        name: true,
        type: true,
        subtitle: true,
        operation: true,
        createdAt: true,
        treeGenreId: true,
        nsfw: true,
      },
      orderBy: desc(genreHistory.createdAt),
    })
  }
}
