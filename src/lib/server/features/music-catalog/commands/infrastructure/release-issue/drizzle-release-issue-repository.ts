import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  releaseIssueArtists,
  releaseIssues,
  releaseIssueTracks,
  trackArtists,
  tracks,
} from '$lib/server/db/schema'

import type { ReleaseIssue } from '../../domain/aggregates/release-issue'
import type { Track } from '../../domain/aggregates/track'
import type { ReleaseIssueRepository } from '../../domain/repositories/release-issue-repository'

export class DrizzleReleaseIssueRepository implements ReleaseIssueRepository {
  constructor(private db: IDrizzleConnection) {}

  async create(releaseIssue: ReleaseIssue): Promise<number> {
    const releaseIssueId = await this.db.transaction(async (tx) => {
      const [{ releaseIssueId }] = await tx
        .insert(releaseIssues)
        .values({
          releaseId: releaseIssue.releaseId,
          title: releaseIssue.title,
          art: releaseIssue.art,
        })
        .returning({ releaseIssueId: releaseIssues.id })

      await tx.insert(releaseIssueArtists).values(
        releaseIssue.artists.map((artistId, i) => ({
          releaseIssueId,
          artistId,
          order: i,
        })),
      )

      for (const [i, track] of releaseIssue.tracks.entries()) {
        let trackId = track.track.id
        if (trackId === undefined) {
          trackId = await this.insertTrack(track.track, tx)
        } else {
          await this.updateTrack(trackId, track.track, tx)
        }

        await tx.insert(releaseIssueTracks).values({
          releaseIssueId,
          trackId,
          order: i,

          title: track.overrides.title,
          durationMs: track.overrides.durationMs?.value,
        })
      }

      return releaseIssueId
    })

    return releaseIssueId
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
