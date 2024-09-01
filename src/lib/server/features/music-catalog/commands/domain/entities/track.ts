export class Track {
  public artists: number[] = []

  constructor(public title: string) {}

  addArtist(artistId: number) {
    this.artists.push(artistId)
  }
}
