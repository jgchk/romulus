import type { ReleaseDate } from '../value-objects/release-date'
import type { ReleaseIssueTrack } from './release-issue-track'

export class ReleaseIssue {
  public readonly artists: number[] = []
  public readonly tracks: ReleaseIssueTrack[] = []

  constructor(
    public readonly releaseId: number,
    public readonly title: string,
    public readonly art: string | undefined,
    public readonly releaseDate: ReleaseDate | undefined,
  ) {}

  addArtist(artistId: number) {
    this.artists.push(artistId)
  }

  addTrack(track: ReleaseIssueTrack) {
    this.tracks.push(track)
  }
}
