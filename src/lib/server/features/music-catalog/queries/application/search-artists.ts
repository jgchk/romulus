import type { IDrizzleConnection } from '$lib/server/db/connection'

export type SearchArtistsResult = {
  artists: {
    id: number
    name: string
  }[]
}

export class SearchArtistsQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(nameQuery: string): Promise<SearchArtistsResult> {
    const results = await this.db.query.artists.findMany({
      where: (artists, { ilike }) => ilike(artists.name, `${nameQuery}%`),
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
