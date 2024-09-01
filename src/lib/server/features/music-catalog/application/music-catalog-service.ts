import { Artist } from '../domain/entities/artist'
import { Release } from '../domain/entities/release'
import { Track } from '../domain/entities/track'
import type { ArtistRepository } from '../domain/repositories/artist-repository'
import type { ReleaseRepository } from '../domain/repositories/release-repository'
import type { TrackRepository } from '../domain/repositories/track-repository'

export type CreateRelease = {
  title: string
  art?: string
  artists: number[]
  tracks: (number | { title: string; artists: number[] })[]
}

export class MusicCatalogService {
  constructor(
    private artistRepo: ArtistRepository,
    private releaseRepo: ReleaseRepository,
    private trackRepo: TrackRepository,
  ) {}

  async createRelease(input: CreateRelease): Promise<number> {
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

  async createArtist(name: string): Promise<number> {
    const artist = new Artist(name)

    const artistId = await this.artistRepo.create(artist)

    return artistId
  }
}
