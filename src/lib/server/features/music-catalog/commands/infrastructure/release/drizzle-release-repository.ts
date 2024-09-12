import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  releaseArtists,
  releases,
  releaseTracks,
  trackArtists,
  tracks,
} from '$lib/server/db/schema'

import type { Release } from '../../domain/entities/release'
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

      const trackIds = await tx
        .insert(tracks)
        .values(
          release.tracks.map((track) => ({
            title: track.title,
          })),
        )
        .returning({ trackId: tracks.id })

      await tx.insert(trackArtists).values(
        trackIds.flatMap(({ trackId }, i) =>
          release.tracks[i].artists.map((artistId, j) => ({
            trackId,
            artistId,
            order: j,
          })),
        ),
      )

      await tx.insert(releaseTracks).values(
        trackIds.map(({ trackId }, i) => ({
          releaseId,
          trackId,
          order: i,
        })),
      )

      return releaseId
    })

    return releaseId
  }
}
