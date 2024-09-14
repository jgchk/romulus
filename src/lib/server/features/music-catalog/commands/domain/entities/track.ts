import type { Duration } from '../value-objects/duration'

export class Track {
  public readonly artists: number[] = []

  constructor(
    public readonly title: string,
    public readonly durationMs: Duration | undefined,
  ) {}

  addArtist(artistId: number) {
    this.artists.push(artistId)
  }
}
