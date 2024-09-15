import type { IDrizzleConnection } from '$lib/server/db/connection'

import { Track } from '../../domain/entities/track'
import type { TrackRepository } from '../../domain/repositories/track-repository'
import { Duration } from '../../domain/value-objects/duration'

export class DrizzleTrackRepository implements TrackRepository {
  constructor(private db: IDrizzleConnection) {}

  async get(id: number): Promise<Track | undefined> {
    const result = await this.db.query.tracks.findFirst({
      where: (tracks, { eq }) => eq(tracks.id, id),
      with: {
        artists: {
          columns: { artistId: true },
          orderBy: (trackArtists, { asc }) => asc(trackArtists.order),
        },
      },
    })

    if (result === undefined) return

    let durationMs = result.durationMs !== null ? Duration.create(result.durationMs) : undefined
    if (durationMs instanceof Error) {
      console.error(`Invalid duration for track ${id}: ${durationMs.message}`)
      durationMs = undefined
    }

    return new Track(
      id,
      result.title,
      result.artists.map((a) => a.artistId),
      durationMs,
    )
  }
}
