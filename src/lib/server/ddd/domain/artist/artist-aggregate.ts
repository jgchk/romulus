import type { Order } from '../common/value-objects'
import type { Release } from '../release/release'
import type { Track } from '../track/track'
import type { Artist } from './artist'

export class ArtistAggregate {
  private releases = new Map<number, Order>()
  private tracks = new Map<number, Order>()

  constructor(public artist: Artist) {}

  addRelease(release: Release, order: Order): void {
    this.releases.set(release.id, order)
  }

  addTrack(track: Track, order: Order): void {
    this.tracks.set(track.id, order)
  }

  getReleases(): [number, Order][] {
    return Array.from(this.releases.entries())
  }

  getTracks(): [number, Order][] {
    return Array.from(this.tracks.entries())
  }
}
