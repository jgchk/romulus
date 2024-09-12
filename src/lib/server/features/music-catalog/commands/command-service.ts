import { CreateArtistCommand } from './application/create-artist'
import { CreateReleaseCommand, type CreateReleaseRequest } from './application/create-release'
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

  createRelease(input: CreateReleaseRequest): Promise<number> {
    return this.createReleaseCommand.execute(input)
  }

  createArtist(name: string): Promise<number> {
    return this.createArtistCommand.execute(name)
  }
}
