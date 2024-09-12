export class Track {
  public readonly artists: number[] = []

  constructor(public readonly title: string) {}

  addArtist(artistId: number) {
    this.artists.push(artistId)
  }
}
