import { Release } from '../../domain/entities/release'
import { Track } from '../../domain/entities/track'
import type { NonexistentDateError } from '../../domain/errors/nonexistent-date'
import type { ReleaseDatePrecisionError } from '../../domain/errors/release-date-precision'
import type { ReleaseRepository } from '../../domain/repositories/release-repository'
import { Duration } from '../../domain/value-objects/duration'
import { ReleaseDate } from '../../domain/value-objects/release-date'
import { InvalidTrackError } from '../errors/invalid-track-error'

export type CreateReleaseRequest = {
  title: string
  art: string | undefined
  releaseDate: { year: number; month?: number; day?: number } | undefined
  artists: number[]
  tracks: { title: string; artists: number[]; durationMs: number | undefined }[]
}

export class CreateReleaseCommand {
  constructor(private releaseRepo: ReleaseRepository) {}

  async execute(
    input: CreateReleaseRequest,
  ): Promise<number | ReleaseDatePrecisionError | NonexistentDateError | InvalidTrackError> {
    const releaseDate =
      input.releaseDate !== undefined
        ? ReleaseDate.create(input.releaseDate.year, input.releaseDate.month, input.releaseDate.day)
        : undefined

    if (releaseDate instanceof Error) {
      return releaseDate
    }

    const release = new Release(input.title, input.art, releaseDate)

    for (const artist of input.artists) {
      release.addArtist(artist)
    }

    for (const [i, track] of input.tracks.entries()) {
      const durationMs =
        track.durationMs !== undefined ? Duration.create(track.durationMs) : undefined

      if (durationMs instanceof Error) {
        return new InvalidTrackError(i, durationMs)
      }

      const track_ = new Track(track.title, durationMs)

      for (const artist of track.artists) {
        track_.addArtist(artist)
      }

      release.addTrack(track_)
    }

    const releaseId = await this.releaseRepo.create(release)

    return releaseId
  }
}
