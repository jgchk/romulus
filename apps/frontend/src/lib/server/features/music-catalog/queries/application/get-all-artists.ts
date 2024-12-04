import type { IDrizzleConnection } from '$lib/server/db/connection'

export type GetAllArtistsResult = {
  artists: {
    id: number
    name: string
  }[]
}

export class GetAllArtistsQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(): Promise<GetAllArtistsResult> {
    const results = await this.db.query.artists.findMany({
      columns: {
        id: true,
        name: true,
      },
    })

    return {
      artists: results.map((release) => ({
        id: release.id,
        name: release.name,
      })),
    }
  }
}
