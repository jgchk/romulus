import type { IDrizzleConnection } from '$lib/server/db/connection'

export type GetArtistResult = {
  artist:
    | {
        id: number
        name: string
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
    | undefined
}

export class GetArtistQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(id: number): Promise<GetArtistResult> {
    const result = await this.db.query.artists.findFirst({
      where: (artists, { eq }) => eq(artists.id, id),
      with: {
        releases: {
          columns: {},
          with: {
            release: {
              columns: {
                id: true,
                title: true,
                art: true,
              },
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
            },
          },
        },
      },
    })

    if (!result) {
      return { artist: undefined }
    }

    return {
      artist: {
        id: result.id,
        name: result.name,
        releases: result.releases.map((release) => ({
          id: release.release.id,
          title: release.release.title,
          art: release.release.art ?? undefined,
          artists: release.release.artists.map((artist) => ({
            id: artist.artist.id,
            name: artist.artist.name,
          })),
        })),
      },
    }
  }
}
