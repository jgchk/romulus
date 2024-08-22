import type { SQL } from 'drizzle-orm'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type Artist, artists, type InsertArtist, type Release, type Track } from '../schema'

export const FIND_MANY_INCLUDE = ['releases', 'releases-full', 'tracks', 'tracks-full'] as const
export type FindInclude = (typeof FIND_MANY_INCLUDE)[number]

export const FIND_ALL_SORT_FIELD = ['id'] as const
export type FindManySortField = (typeof FIND_ALL_SORT_FIELD)[number]

export const FIND_ALL_SORT_ORDER = ['asc', 'desc'] as const
export type FindManySortOrder = (typeof FIND_ALL_SORT_ORDER)[number]

export type FindManyParams<I extends FindInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: {
    ids?: number[]
  }
  sort?: {
    field?: FindManySortField
    order?: FindManySortOrder
  }
}

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
    if (includeTracksFull) {
      // @ts-expect-error - we are dynamically adding a new field
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      output.tracks = result.tracks.map((t) => t.track)
    } else if (includeTracks) {
      // @ts-expect-error - we are dynamically adding a new field
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      output.tracks = result.tracks.map((t) => t.trackId)
    }

    // @ts-expect-error - we are dynamically adding new fields
    return output
  }

  async findMany<I extends FindInclude = never>(
    { skip, limit, include = [], filter = {}, sort = {} }: FindManyParams<I>,
    conn: IDrizzleConnection,
  ): Promise<{ results: FindArtist<I>[]; total: number }> {
    const includeReleases = (include as string[]).includes('releases')
    const includeReleasesFull = (include as string[]).includes('releases-full')
    const includeTracks = (include as string[]).includes('tracks')
    const includeTracksFull = (include as string[]).includes('tracks-full')

    const wheres: (SQL | undefined)[] = []
    if (filter.ids !== undefined) {
      wheres.push(inArray(artists.id, filter.ids))
    }
    const where = wheres.length > 0 ? and(...wheres) : undefined

    const sortDirection = sort?.order === 'desc' ? desc : asc

    let sortField
    if (sort.field === 'id') {
      sortField = artists.id
    } else {
      sortField = artists.id
    }

    const dataQuery = conn.query.artists.findMany({
      where,
      offset: skip,
      limit,
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
      orderBy: sortField ? sortDirection(sortField) : undefined,
    })
    const totalQuery = conn.select({ total: count() }).from(artists).where(where).$dynamic()

    const queryResults = limit === 0 ? [] : await dataQuery.execute()
    const totalResults = await totalQuery.execute()

    const results = queryResults.map((input) => {
      const output = input

      if (includeReleasesFull) {
        // @ts-expect-error - we are dynamically adding a new field
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        output.releases = input.releases.map((r) => r.release)
      } else if (includeReleases) {
        // @ts-expect-error - we are dynamically adding a new field
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        output.releases = input.releases.map((r) => r.releaseId)
      }
      if (includeTracksFull) {
        // @ts-expect-error - we are dynamically adding a new field
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        output.tracks = input.tracks.map((t) => t.track)
      } else if (includeTracks) {
        // @ts-expect-error - we are dynamically adding a new field
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        output.tracks = input.tracks.map((t) => t.trackId)
      }

      return output
    })

    return {
      // @ts-expect-error - we are dynamically adding new fields
      results,
      total: totalResults.length > 0 ? totalResults[0].total : 0,
    }
  }
}
