import { Track } from './track'
import { Artist } from '../artist/artist'
import { Release } from '../release/release'
import { Order } from '../common/value-objects'

export class TrackAggregate {
  private artists: Map<number, Order> = new Map()
  private releases: Map<number, Order> = new Map()

  constructor(public track: Track) {}

  addArtist(artist: Artist, order: Order): void {
    this.artists.set(artist.id, order)
  }

  addRelease(release: Release, order: Order): void {
    this.releases.set(release.id, order)
  }

  getArtists(): Array<[number, Order]> {
    return Array.from(this.artists.entries())
  }

  getReleases(): Array<[number, Order]> {
    return Array.from(this.releases.entries())
  }
}
