import type { ReleaseDate } from '../value-objects/release-date'
import type { Track } from './track'

export class Release {
  public readonly artists: number[] = []
  public readonly tracks: Track[] = []

  constructor(
    public readonly title: string,
    public readonly art: string | undefined,
    public readonly releaseDate: ReleaseDate | undefined,
  ) {}

  addArtist(artistId: number) {
    this.artists.push(artistId)
  }

  addTrack(track: Track) {
    this.tracks.push(track)
  }
}
