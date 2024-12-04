import type { IDrizzleConnection } from '$lib/server/db/connection'

export type GetAllTracksResult = {
  tracks: {
    id: number
    title: string
  }[]
}

export class GetAllTracksQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(): Promise<GetAllTracksResult> {
    const results = await this.db.query.tracks.findMany({
      columns: {
        id: true,
        title: true,
      },
    })

    return {
      tracks: results.map((track) => ({
        id: track.id,
        title: track.title,
      })),
    }
  }
}
