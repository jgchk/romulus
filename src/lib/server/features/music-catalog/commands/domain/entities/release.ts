export class Release {
  public artists: number[] = []
  public tracks: number[] = []

  constructor(
    public title: string,
    public art?: string,
  ) {}

  addArtist(artistId: number) {
    this.artists.push(artistId)
  }

  addTrack(trackId: number) {
    this.tracks.push(trackId)
  }
}
