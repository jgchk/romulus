import { CreateArtistCommand } from './application/commands/create-artist'
import {
  CreateReleaseCommand,
  type CreateReleaseRequest,
} from './application/commands/create-release'
import type { ArtistRepository } from './domain/repositories/artist-repository'
import type { ReleaseRepository } from './domain/repositories/release-repository'
import type { TrackRepository } from './domain/repositories/track-repository'

export class MusicCatalogCommandService {
  private createReleaseCommand: CreateReleaseCommand
  private createArtistCommand: CreateArtistCommand

  constructor(
    artistRepo: ArtistRepository,
    releaseRepo: ReleaseRepository,
    trackRepo: TrackRepository,
  ) {
    this.createReleaseCommand = new CreateReleaseCommand(releaseRepo, trackRepo)
    this.createArtistCommand = new CreateArtistCommand(artistRepo)
  }

  createRelease(input: CreateReleaseRequest) {
    return this.createReleaseCommand.execute(input)
  }

  createArtist(name: string) {
    return this.createArtistCommand.execute(name)
  }
}
