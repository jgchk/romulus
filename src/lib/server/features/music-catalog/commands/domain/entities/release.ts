import type { ReleaseDate } from '../value-objects/release-date'
import type { ReleaseTrack } from './release-track'

export class Release {
  public readonly artists: number[] = []
  public readonly tracks: ReleaseTrack[] = []

  constructor(
    public readonly title: string,
    public readonly art: string | undefined,
    public readonly releaseDate: ReleaseDate | undefined,
  ) {}

  addArtist(artistId: number) {
    this.artists.push(artistId)
  }

  addTrack(track: ReleaseTrack) {
    this.tracks.push(track)
  }
}
