import type { SQL } from 'drizzle-orm'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import {
  type Artist,
  type InsertRelease,
  type InsertTrack,
  type Release,
  releaseArtists,
  releases,
  releaseTracks,
  type Track,
  trackArtists,
  tracks,
} from '../schema'

export type ExtendedInsertRelease = InsertRelease & {
  artists: number[]
  tracks: ExtendedInsertTrack[]
}

export type ExtendedInsertTrack = InsertTrack & {
  artists: number[]
}

export type ExtendedRelease = Release & {
  artists: number[]
  tracks: Track[]
}

export const FIND_MANY_INCLUDE = ['artists', 'artists-full', 'tracks', 'tracks-full'] as const
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

export type FindRelease<T extends FindInclude> = Release & {
  artists: T extends 'artists' ? number[] : T extends 'artists-full' ? Artist[] : never
  tracks: T extends 'tracks' ? number[] : T extends 'tracks-full' ? Track[] : never
}

export default class ReleasesDatabase {
  insert(data: ExtendedInsertRelease[], conn: IDrizzleConnection): Promise<ExtendedRelease[]> {
    return conn.transaction(async (tx) => {
      const entries = await tx.insert(releases).values(data).returning()

      const artists = data.flatMap((entry, i) =>
        entry.artists.map((artistId) => ({ releaseId: entries[i].id, artistId, order: i })),
      )
      if (artists.length > 0) {
        await tx.insert(releaseArtists).values(artists)
      }

      for (const [i, release] of data.entries()) {
        if (release.tracks.length > 0) {
          const trackEntries = await tx.insert(tracks).values(release.tracks).returning()
          await tx
            .insert(releaseTracks)
            .values(
              trackEntries.map((t, order) => ({ releaseId: entries[i].id, trackId: t.id, order })),
            )

          const trackArtists_ = release.tracks.flatMap((track, j) =>
            track.artists.map((artistId, order) => ({
              trackId: trackEntries[j].id,
              artistId,
              order,
            })),
          )
          if (trackArtists_.length > 0) {
            await tx.insert(trackArtists).values(trackArtists_)
          }
        }
      }

      const results = await tx.query.releases.findMany({
        where: inArray(
          releases.id,
          entries.map((entry) => entry.id),
        ),
        with: {
          artists: { columns: { artistId: true } },
          tracks: { columns: {}, with: { track: true } },
        },
      })

      return results.map((release) => ({
        ...release,
        artists: release.artists.map((a) => a.artistId),
        tracks: release.tracks.map((t) => t.track),
      }))
    })
  }

  async findMany<I extends FindInclude>(
    { skip, limit, include = [], filter = {}, sort = {} }: FindManyParams<I>,
    conn: IDrizzleConnection,
  ): Promise<{ results: FindRelease<I>[]; total: number }> {
    const includeArtists = (include as string[]).includes('artists')
    const includeArtistsFull = (include as string[]).includes('artists-full')
    const includeTracks = (include as string[]).includes('tracks')
    const includeTracksFull = (include as string[]).includes('tracks-full')

    const wheres: (SQL | undefined)[] = []
    if (filter.ids !== undefined) {
      wheres.push(inArray(releases.id, filter.ids))
    }
    const where = wheres.length > 0 ? and(...wheres) : undefined

    const sortDirection = sort?.order === 'desc' ? desc : asc

    let sortField
    if (sort.field === 'id') {
      sortField = releases.id
    } else {
      sortField = releases.id
    }

    const dataQuery = conn.query.releases.findMany({
      where,
      offset: skip,
      limit,
      with: {
        artists: includeArtistsFull
          ? { columns: {}, with: { artist: true }, orderBy: (a) => a.order }
          : includeArtists
            ? { columns: { artistId: true }, orderBy: (a) => a.order }
            : undefined,
        tracks: includeTracksFull
          ? { columns: {}, with: { track: true }, orderBy: (t) => t.order }
          : includeTracks
            ? { columns: { trackId: true }, orderBy: (t) => t.order }
            : undefined,
      },
      orderBy: sortField ? sortDirection(sortField) : undefined,
    })
    const totalQuery = conn.select({ total: count() }).from(releases).where(where).$dynamic()

    const queryResults = limit === 0 ? [] : await dataQuery.execute()
    const totalResults = await totalQuery.execute()

    const results = queryResults.map((input) => {
      const output = input

      if (includeArtistsFull) {
        // @ts-expect-error - we are dynamically adding a new field
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        output.artists = input.artists.map((a) => a.artist)
      } else if (includeArtists) {
        // @ts-expect-error - we are dynamically adding a new field
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
        output.artists = input.artists.map((a) => a.artistId)
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

  async findById<I extends FindInclude>(
    id: number,
    { include = [] }: { include?: I[] },
    conn: IDrizzleConnection,
  ): Promise<FindRelease<I> | undefined> {
    const includeArtists = (include as string[]).includes('artists')
    const includeArtistsFull = (include as string[]).includes('artists-full')
    const includeTracks = (include as string[]).includes('tracks')
    const includeTracksFull = (include as string[]).includes('tracks-full')

    const result = await conn.query.releases.findFirst({
      where: eq(releases.id, id),
      with: {
        artists: includeArtistsFull
          ? { columns: {}, with: { artist: true }, orderBy: (a) => a.order }
          : includeArtists
            ? { columns: { artistId: true }, orderBy: (a) => a.order }
            : undefined,
        tracks: includeTracksFull
          ? { columns: {}, with: { track: true }, orderBy: (t) => t.order }
          : includeTracks
            ? { columns: { trackId: true }, orderBy: (t) => t.order }
            : undefined,
      },
    })

    if (!result) {
      return undefined
    }

    const output = result
    if (includeArtistsFull) {
      // @ts-expect-error - we are dynamically adding a new field
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      output.artists = result.artists.map((a) => a.artist)
    } else if (includeArtists) {
      // @ts-expect-error - we are dynamically adding a new field
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      output.artists = result.artists.map((a) => a.artistId)
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
}
