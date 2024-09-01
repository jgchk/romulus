import type { IDrizzleConnection } from '$lib/server/db/connection'

export type GetAllReleasesResult = {
  releases: {
    id: number
    title: string
    art?: string
    artists: {
      id: number
      name: string
    }[]
  }[]
}

export class GetAllReleasesQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(): Promise<GetAllReleasesResult> {
    const results = await this.db.query.releases.findMany({
      with: {
        artists: {
          orderBy: (artists, { asc }) => asc(artists.order),
          columns: {},
          with: {
            artist: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return {
      releases: results.map((release) => ({
        id: release.id,
        title: release.title,
        art: release.art ?? undefined,
        artists: release.artists.map((artist) => ({
          id: artist.artist.id,
          name: artist.artist.name,
        })),
      })),
    }
  }
}
