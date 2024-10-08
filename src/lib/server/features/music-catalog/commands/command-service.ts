import { CreateArtistCommand } from './application/commands/create-artist'
import {
  CreateReleaseCommand,
  type CreateReleaseRequest,
} from './application/commands/create-release'
import {
  CreateReleaseIssueCommand,
  type CreateReleaseIssueRequest,
} from './application/commands/create-release-issue'
import { DeleteArtistCommand } from './application/commands/delete-artist'
import { DeleteReleaseCommand } from './application/commands/delete-release'
import { DeleteTrackCommand } from './application/commands/delete-track'
import type { ArtistRepository } from './domain/repositories/artist-repository'
import type { ReleaseIssueRepository } from './domain/repositories/release-issue-repository'
import type { ReleaseRepository } from './domain/repositories/release-repository'
import type { TrackRepository } from './domain/repositories/track-repository'

export class MusicCatalogCommandService {
  private createArtistCommand: CreateArtistCommand
  private deleteArtistCommand: DeleteArtistCommand
  private createReleaseCommand: CreateReleaseCommand
  private deleteReleaseCommand: DeleteReleaseCommand
  private createReleaseIssueCommand: CreateReleaseIssueCommand
  private deleteTrackCommand: DeleteTrackCommand

  constructor(
    artistRepo: ArtistRepository,
    releaseRepo: ReleaseRepository,
    releaseIssueRepo: ReleaseIssueRepository,
    trackRepo: TrackRepository,
  ) {
    this.createArtistCommand = new CreateArtistCommand(artistRepo)
    this.deleteArtistCommand = new DeleteArtistCommand(artistRepo)
    this.createReleaseCommand = new CreateReleaseCommand(releaseRepo, trackRepo)
    this.deleteReleaseCommand = new DeleteReleaseCommand(releaseRepo)
    this.createReleaseIssueCommand = new CreateReleaseIssueCommand(releaseIssueRepo, trackRepo)
    this.deleteTrackCommand = new DeleteTrackCommand(trackRepo)
  }

  createArtist(name: string) {
    return this.createArtistCommand.execute(name)
  }

  deleteArtist(artistId: number) {
    return this.deleteArtistCommand.execute(artistId)
  }

  createRelease(input: CreateReleaseRequest) {
    return this.createReleaseCommand.execute(input)
  }

  deleteRelease(releaseId: number) {
    return this.deleteReleaseCommand.execute(releaseId)
  }

  createReleaseIssue(input: CreateReleaseIssueRequest) {
    return this.createReleaseIssueCommand.execute(input)
  }

  deleteTrack(trackId: number) {
    return this.deleteTrackCommand.execute(trackId)
  }
}
