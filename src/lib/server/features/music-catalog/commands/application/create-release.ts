import { Release } from '../domain/entities/release'
import { Track } from '../domain/entities/track'
import type { ReleaseRepository } from '../domain/repositories/release-repository'

export type CreateReleaseRequest = {
  title: string
  art?: string
  artists: number[]
  tracks: { title: string; artists: number[] }[]
}

export class CreateReleaseCommand {
  constructor(private releaseRepo: ReleaseRepository) {}

  async execute(input: CreateReleaseRequest): Promise<number> {
    const release = new Release(input.title, input.art)

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
