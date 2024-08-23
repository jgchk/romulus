import { Order } from '../../domain/common/value-objects'
import { Release } from '../../domain/release/release'
import { ReleaseAggregate } from '../../domain/release/release-aggregate'
import { Track } from '../../domain/track/track'
import { TrackAggregate } from '../../domain/track/track-aggregate'
import type { ArtistRepository } from '../../infrastructure/repositories/artist/artist-repository'
import type { ReleaseRepository } from '../../infrastructure/repositories/release-repository'
import type { TrackRepository } from '../../infrastructure/repositories/track-repository'

type CreateReleaseWithTracksInput = {
  title: string
  art?: string
  artists: { id: number; order: number }[]
  tracks: { title: string; order: number; artists: { id: number; order: number }[] }[]
}

export class MusicCatalogService {
  constructor(
    private artistRepo: ArtistRepository,
    private releaseRepo: ReleaseRepository,
    private trackRepo: TrackRepository,
  ) {}

  async createReleaseWithTracks(input: CreateReleaseWithTracksInput): Promise<Release> {
    // Create the release
    const release = new Release(0, input.title, input.art)
    await this.releaseRepo.save(release)

    const releaseAggregate = new ReleaseAggregate(release)

    // Add artists to the release
    for (const artistInput of input.artists) {
      const artistAggregate = await this.artistRepo.getAggregateById(artistInput.id)
      if (!artistAggregate) {
        throw new Error(`Artist with id ${artistInput.id} not found`)
      }
      const orderValue = new Order(artistInput.order)
      releaseAggregate.addArtist(artistAggregate.artist, orderValue)
      artistAggregate.addRelease(release, orderValue)
      await this.artistRepo.saveAggregate(artistAggregate)
    }

    // Create tracks and add them to the release
    for (const trackInput of input.tracks) {
      const track = new Track(0, trackInput.title)
      await this.trackRepo.save(track)

      const trackAggregate = new TrackAggregate(track)

      // Add the track to the release
      const trackOrderValue = new Order(trackInput.order)
      releaseAggregate.addTrack(track, trackOrderValue)
      trackAggregate.addRelease(release, trackOrderValue)

      // Add artists to the track
      for (const artistInput of trackInput.artists) {
        const artistAggregate = await this.artistRepo.getAggregateById(artistInput.id)
        if (!artistAggregate) {
          throw new Error(`Artist with id ${artistInput.id} not found`)
        }
        const artistOrderValue = new Order(artistInput.order)
        trackAggregate.addArtist(artistAggregate.artist, artistOrderValue)
        artistAggregate.addTrack(track, artistOrderValue)
        await this.artistRepo.saveAggregate(artistAggregate)
      }

      await this.trackRepo.saveAggregate(trackAggregate)
    }

    await this.releaseRepo.saveAggregate(releaseAggregate)

    return release
  }
}
