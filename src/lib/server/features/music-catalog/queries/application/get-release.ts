import type { IDrizzleConnection } from '$lib/server/db/connection'

export type GetReleaseResult = {
  release:
    | {
        id: number
        title: string
        art?: string
        artists: {
          id: number
          name: string
        }[]
        tracks: {
          id: number
          title: string
        }[]
      }
    | undefined
}

export class GetReleaseQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(id: number): Promise<GetReleaseResult> {
    const result = await this.db.query.releases.findFirst({
      where: (releases, { eq }) => eq(releases.id, id),
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
        tracks: {
          orderBy: (tracks, { asc }) => asc(tracks.order),
          columns: {},
          with: {
            track: {
              columns: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    if (!result) {
      return { release: undefined }
    }

    return {
      release: {
        id: result.id,
        title: result.title,
        art: result.art ?? undefined,
        artists: result.artists.map((artist) => ({
          id: artist.artist.id,
          name: artist.artist.name,
        })),
        tracks: result.tracks.map((track) => ({
          id: track.track.id,
          title: track.track.title,
        })),
      },
    }
  }
}
