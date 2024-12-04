import type { IDrizzleConnection } from '$lib/server/db/connection'

export class GetRandomGenreIdQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(): Promise<number | undefined> {
    const results = await this.db.query.genres.findMany({
      columns: {
        id: true,
      },
    })

    const ids = results.map(({ id }) => id)
    if (ids.length === 0) return undefined

    const randomId = ids[Math.floor(Math.random() * ids.length)]
    return randomId
  }
}
