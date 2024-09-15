import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  releaseArtists,
  releases,
  releaseTracks,
  trackArtists,
  tracks,
} from '$lib/server/db/schema'

import type { Release } from '../../domain/entities/release'
import type { Track } from '../../domain/entities/track'
import type { ReleaseRepository } from '../../domain/repositories/release-repository'

export class DrizzleReleaseRepository implements ReleaseRepository {
  constructor(private db: IDrizzleConnection) {}

  async create(release: Release): Promise<number> {
    const releaseId = await this.db.transaction(async (tx) => {
      const [{ releaseId }] = await tx
        .insert(releases)
        .values({
          title: release.title,
          art: release.art,
        })
        .returning({ releaseId: releases.id })

      await tx.insert(releaseArtists).values(
        release.artists.map((artistId, i) => ({
          releaseId,
          artistId,
          order: i,
        })),
      )

      for (const [i, track] of release.tracks.entries()) {
        let trackId = track.track.id
        if (trackId === undefined) {
          trackId = await this.insertTrack(track.track, tx)
        } else {
          await this.updateTrack(trackId, track.track, tx)
        }

        await tx.insert(releaseTracks).values({
          releaseId,
          trackId,
          order: i,

          title: track.overrides.title,
          durationMs: track.overrides.durationMs?.value,
        })
      }

      return releaseId
    })

    return releaseId
  }

  private async insertTrack(track: Track, tx: IDrizzleConnection) {
    const [{ trackId }] = await tx
      .insert(tracks)
      .values({
        title: track.title,
        durationMs: track.durationMs?.value,
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
  }

  private async updateTrack(trackId: number, track: Track, tx: IDrizzleConnection) {
    await tx
      .update(tracks)
      .set({
        title: track.title,
        durationMs: track.durationMs?.value,
      })
      .where(eq(tracks.id, trackId))

    await tx.delete(trackArtists).where(eq(trackArtists.trackId, trackId))
    await tx.insert(trackArtists).values(
      track.artists.map((artistId, i) => ({
        trackId,
        artistId,
        order: i,
      })),
    )
  }
}
