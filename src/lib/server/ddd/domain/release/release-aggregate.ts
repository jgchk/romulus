import { Release } from './release'
import { Artist } from '../artist/artist'
import { Track } from '../track/track'
import { Order } from '../common/value-objects'

export class ReleaseAggregate {
  private artists: Map<number, Order> = new Map()
  private tracks: Map<number, Order> = new Map()

  constructor(public release: Release) {}

  addArtist(artist: Artist, order: Order): void {
    this.artists.set(artist.id, order)
  }

  addTrack(track: Track, order: Order): void {
    this.tracks.set(track.id, order)
  }

  getArtists(): Array<[number, Order]> {
    return Array.from(this.artists.entries())
  }

  getTracks(): Array<[number, Order]> {
    return Array.from(this.tracks.entries())
  }
}
