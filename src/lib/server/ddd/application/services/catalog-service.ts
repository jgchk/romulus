import { Release } from '../../domain/release/release'
import { Track } from '../../domain/track/track'
import type { ReleaseRepository } from '../../infrastructure/repositories/release/release-repository'
import type { TrackRepository } from '../../infrastructure/repositories/track/track-repository'

export type CreateReleaseWithTracksInput = {
  title: string
  art?: string
  artists: number[]
  tracks: (number | { title: string; artists: number[] })[]
}

export class MusicCatalogService {
  constructor(
    private releaseRepo: ReleaseRepository,
    private trackRepo: TrackRepository,
  ) {}

  async createReleaseWithTracks(input: CreateReleaseWithTracksInput): Promise<number> {
    const release = new Release(input.title, input.art)

    for (const artist of input.artists) {
      release.addArtist(artist)
    }

    for (const track of input.tracks) {
      if (typeof track === 'number') {
        release.addTrack(track)
      } else {
        const track_ = new Track(track.title)
        for (const artist of track.artists) {
          track_.addArtist(artist)
        }
        const trackId = await this.trackRepo.create(track_)
        release.addTrack(trackId)
      }
    }

    const releaseId = await this.releaseRepo.create(release)

    return releaseId
  }
}
