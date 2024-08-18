import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type Artist, type Release, type Track, tracks } from '../schema'

export const FIND_MANY_INCLUDE = ['artists', 'artists-full', 'releases', 'releases-full'] as const
export type FindInclude = (typeof FIND_MANY_INCLUDE)[number]

export type FindTrack<T extends FindInclude> = Track & {
  artists: T extends 'artists' ? number[] : T extends 'artists-full' ? Artist[] : never
  releases: T extends 'releases' ? number[] : T extends 'releases-full' ? Release[] : never
}

export default class TracksDatabase {
  async findById<I extends FindInclude>(
    id: number,
    { include = [] }: { include?: I[] },
    conn: IDrizzleConnection,
  ): Promise<FindTrack<I> | undefined> {
    const includeArtists = (include as string[]).includes('artists')
    const includeArtistsFull = (include as string[]).includes('artists-full')
    const includeReleases = (include as string[]).includes('releases')
    const includeReleasesFull = (include as string[]).includes('releases-full')

    const result = await conn.query.tracks.findFirst({
      where: eq(tracks.id, id),
      with: {
        artists: includeArtistsFull
          ? { columns: {}, with: { artist: true }, orderBy: (a) => a.order }
          : includeArtists
            ? { columns: { artistId: true }, orderBy: (a) => a.order }
            : undefined,
        releases: includeReleasesFull
          ? { columns: {}, with: { release: true } }
          : includeReleases
            ? { columns: { releaseId: true } }
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
