import type { IDrizzleConnection } from '$lib/server/db/connection'
import { trackArtists, tracks } from '$lib/server/db/schema'

import type { Track } from '../../domain/track'
import type { TrackRepository } from './track-repository'

export class DrizzleTrackRepository implements TrackRepository {
  constructor(private db: IDrizzleConnection) {}

  async create(track: Track): Promise<number> {
    const trackId = await this.db.transaction(async (tx) => {
      const [{ trackId }] = await tx
        .insert(tracks)
        .values({
          title: track.title,
        })
        .returning({ trackId: tracks.id })

      await tx.insert(trackArtists).values(
        track.artists.map((artistId, i) => ({
          trackId,
          artistId,
          order: i,
        })),
      )

      return trackId
    })

    return trackId
  }
}
