import { Release } from '../domain/entities/release'
import { Track } from '../domain/entities/track'
import type { NonexistentDateError } from '../domain/errors/nonexistent-date'
import type { ReleaseDatePrecisionError } from '../domain/errors/release-date-precision'
import type { ReleaseRepository } from '../domain/repositories/release-repository'
import { ReleaseDate } from '../domain/value-objects/release-date'

export type CreateReleaseRequest = {
  title: string
  art?: string
  releaseDate?: { year: number; month?: number; day?: number }
  artists: number[]
  tracks: { title: string; artists: number[] }[]
}

export class CreateReleaseCommand {
  constructor(private releaseRepo: ReleaseRepository) {}

  async execute(
    input: CreateReleaseRequest,
  ): Promise<number | ReleaseDatePrecisionError | NonexistentDateError> {
    const releaseDate = input.releaseDate
      ? ReleaseDate.create(input.releaseDate.year, input.releaseDate.month, input.releaseDate.day)
      : undefined

    if (releaseDate instanceof Error) {
      return releaseDate
    }

    const release = new Release(input.title, input.art, releaseDate)

    for (const artist of input.artists) {
      release.addArtist(artist)
    }

    for (const track of input.tracks) {
      const track_ = new Track(track.title)

      for (const artist of track.artists) {
        track_.addArtist(artist)
      }

      release.addTrack(track_)
    }

    const releaseId = await this.releaseRepo.create(release)

    return releaseId
  }
}
