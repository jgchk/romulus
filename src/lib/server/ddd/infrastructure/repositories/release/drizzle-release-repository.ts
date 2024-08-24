import type { IDrizzleConnection } from '$lib/server/db/connection'
import { releaseArtists, releases, releaseTracks } from '$lib/server/db/schema'
import type { Release } from '$lib/server/ddd/domain/release/release'

import type { ReleaseRepository } from './release-repository'

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

      await tx.insert(releaseTracks).values(
        release.tracks.map((trackId, i) => ({
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
