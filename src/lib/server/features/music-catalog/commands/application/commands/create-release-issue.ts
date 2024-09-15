import { ReleaseIssue } from '../../domain/aggregates/release-issue'
import { ReleaseIssueTrack } from '../../domain/aggregates/release-issue/release-issue-track'
import { Track } from '../../domain/aggregates/track'
import type { NonexistentDateError } from '../../domain/errors/nonexistent-date'
import type { ReleaseDatePrecisionError } from '../../domain/errors/release-date-precision'
import type { ReleaseIssueRepository } from '../../domain/repositories/release-issue-repository'
import type { TrackRepository } from '../../domain/repositories/track-repository'
import { Duration } from '../../domain/value-objects/duration'
import { ReleaseDate } from '../../domain/value-objects/release-date'
import { InvalidTrackError } from '../errors/invalid-track'
import { NonexistentTrackError } from '../errors/nonexistent-track'

export type CreateReleaseIssueRequest = {
  releaseId: number
  title: string
  art: string | undefined
  releaseDate: { year: number; month?: number; day?: number } | undefined
  artists: number[]
  tracks: (NewTrack | TrackReference)[]
}

type NewTrack = { title: string; artists: number[]; durationMs: number | undefined }
type TrackReference = {
  id: number
  overrides?: { title?: string; artists?: number[]; durationMs?: number }
}

export class CreateReleaseIssueCommand {
  constructor(
    private releaseIssueRepo: ReleaseIssueRepository,
    private trackRepo: TrackRepository,
  ) {}

  async execute(
    input: CreateReleaseIssueRequest,
  ): Promise<
    | number
    | ReleaseDatePrecisionError
    | NonexistentDateError
    | NonexistentTrackError
    | InvalidTrackError
  > {
    const releaseDate =
      input.releaseDate !== undefined
        ? ReleaseDate.create(input.releaseDate.year, input.releaseDate.month, input.releaseDate.day)
        : undefined

    if (releaseDate instanceof Error) {
      return releaseDate
    }

    const releaseIssue = new ReleaseIssue(input.releaseId, input.title, input.art, releaseDate)

    for (const artist of input.artists) {
      releaseIssue.addArtist(artist)
    }

    for (const [i, track] of input.tracks.entries()) {
      if (isTrackReference(track)) {
        const track_ = await this.trackRepo.get(track.id)
        if (track_ === undefined) {
          return new NonexistentTrackError(i, track.id)
        }

        const releaseIssueTrack = new ReleaseIssueTrack(track_)

        if (track.overrides !== undefined) {
          const durationMs =
            track.overrides.durationMs !== undefined
              ? Duration.create(track.overrides.durationMs)
              : undefined

          if (durationMs instanceof Error) {
            return new InvalidTrackError(i, durationMs)
          }

          releaseIssueTrack.override({
            title: track.overrides.title,
            artists: track.overrides.artists,
            durationMs,
          })
        }

        releaseIssue.addTrack(releaseIssueTrack)
      } else {
        const durationMs =
          track.durationMs !== undefined ? Duration.create(track.durationMs) : undefined

        if (durationMs instanceof Error) {
          return new InvalidTrackError(i, durationMs)
        }

        const track_ = new Track(undefined, track.title, track.artists, durationMs)

        const releaseIssueTrack = new ReleaseIssueTrack(track_)

        releaseIssue.addTrack(releaseIssueTrack)
      }
    }

    const releaseIssueId = await this.releaseIssueRepo.create(releaseIssue)

    return releaseIssueId
  }
}

function isTrackReference(track: NewTrack | TrackReference): track is TrackReference {
  return 'id' in track
}
