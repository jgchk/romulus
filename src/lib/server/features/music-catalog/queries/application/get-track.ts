import type { IDrizzleConnection } from '$lib/server/db/connection'

export type GetTrackResult = {
  track:
    | {
        id: number
        title: string
        releases: {
          id: number
          title: string
        }[]
        releaseIssues: {
          id: number
          title: string
        }[]
      }
    | undefined
}

export class GetTrackQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(id: number): Promise<GetTrackResult> {
    const result = await this.db.query.tracks.findFirst({
      where: (tracks, { eq }) => eq(tracks.id, id),
      columns: { id: true, title: true },
      with: {
        releases: {
          columns: {},
          with: {
            release: {
              columns: {
                id: true,
                title: true,
              },
            },
          },
        },
        releaseIssues: {
          columns: {},
          with: {
            releaseIssue: {
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
      return { track: undefined }
    }

    return {
      track: {
        id: result.id,
        title: result.title,
        releases: result.releases.map((r) => ({
          id: r.release.id,
          title: r.release.title,
        })),
        releaseIssues: result.releaseIssues.map((ri) => ({
          id: ri.releaseIssue.id,
          title: ri.releaseIssue.title,
        })),
      },
    }
  }
}
