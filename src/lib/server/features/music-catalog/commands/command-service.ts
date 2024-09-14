import { CreateArtistCommand } from './application/create-artist'
import { CreateReleaseCommand, type CreateReleaseRequest } from './application/create-release'
import type { NonexistentDateError } from './domain/errors/nonexistent-date'
import type { ReleaseDatePrecisionError } from './domain/errors/release-date-precision'
import type { ArtistRepository } from './domain/repositories/artist-repository'
import type { ReleaseRepository } from './domain/repositories/release-repository'

export class MusicCatalogCommandService {
  private createReleaseCommand: CreateReleaseCommand
  private createArtistCommand: CreateArtistCommand

  constructor(artistRepo: ArtistRepository, releaseRepo: ReleaseRepository) {
    this.createReleaseCommand = new CreateReleaseCommand(releaseRepo)
    this.createArtistCommand = new CreateArtistCommand(artistRepo)
  }

  createRelease(
    input: CreateReleaseRequest,
  ): Promise<number | ReleaseDatePrecisionError | NonexistentDateError> {
    return this.createReleaseCommand.execute(input)
  }

  createArtist(name: string): Promise<number> {
    return this.createArtistCommand.execute(name)
  }
}
