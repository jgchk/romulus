import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type Artist, artists, type InsertArtist, type Release, type Track } from '../schema'

export const FIND_MANY_INCLUDE = ['releases', 'releases-full', 'tracks', 'tracks-full'] as const
export type FindInclude = (typeof FIND_MANY_INCLUDE)[number]

export type FindArtist<T extends FindInclude> = Artist & {
  releases: T extends 'releases' ? number[] : T extends 'releases-full' ? Release[] : never
  tracks: T extends 'tracks' ? number[] : T extends 'tracks-full' ? Track[] : never
}

export default class ArtistsDatabase {
  async insert(data: InsertArtist[], conn: IDrizzleConnection): Promise<Artist[]> {
    const results = await conn.insert(artists).values(data).returning()
    return results
  }

  async findById<I extends FindInclude>(
    id: number,
    { include = [] }: { include?: I[] },
    conn: IDrizzleConnection,
  ): Promise<FindArtist<I> | undefined> {
    const includeReleases = (include as string[]).includes('releases')
    const includeReleasesFull = (include as string[]).includes('releases-full')
    const includeTracks = (include as string[]).includes('tracks')
    const includeTracksFull = (include as string[]).includes('tracks-full')

    const result = await conn.query.artists.findFirst({
      where: eq(artists.id, id),
      with: {
        releases: includeReleasesFull
          ? { columns: {}, with: { release: true } }
          : includeReleases
            ? { columns: { releaseId: true } }
            : undefined,
        tracks: includeTracksFull
          ? { columns: {}, with: { track: true } }
          : includeTracks
            ? { columns: { trackId: true } }
            : undefined,
      },
    })

    if (!result) {
      return undefined
    }

    const output = result
    if (includeReleasesFull) {
      // @ts-expect-error - we are dynamically adding a new field
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      output.releases = result.releases.map((r) => r.release)
    } else if (includeReleases) {
      // @ts-expect-error - we are dynamically adding a new field
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      output.releases = result.releases.map((r) => r.releaseId)
    }

    // @ts-expect-error - we are dynamically adding new fields
    return output
  }
}
