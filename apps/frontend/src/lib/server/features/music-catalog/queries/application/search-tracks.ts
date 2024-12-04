import type { IDrizzleConnection } from '$lib/server/db/connection'

export type SearchTracksResult = {
  tracks: {
    id: number
    title: string
    durationMs: number | undefined
    artists: {
      id: number
      name: string
    }[]
  }[]
}

export class SearchTracksQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(titleQuery: string): Promise<SearchTracksResult> {
    const results = await this.db.query.tracks.findMany({
      where: (tracks, { ilike }) => ilike(tracks.title, `${titleQuery}%`),
      columns: {
        id: true,
        title: true,
        durationMs: true,
      },
      with: {
        artists: {
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
      tracks: results.map((track) => ({
        id: track.id,
        title: track.title,
        durationMs: track.durationMs ?? undefined,
        artists: track.artists.map((trackArtist) => ({
          id: trackArtist.artist.id,
          name: trackArtist.artist.name,
        })),
      })),
    }
  }
}
