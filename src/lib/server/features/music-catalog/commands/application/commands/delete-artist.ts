import type { ArtistRepository } from '../../domain/repositories/artist-repository'

export class DeleteArtistCommand {
  constructor(private readonly artistRepository: ArtistRepository) {}

  async execute(artistId: number): Promise<void> {
    await this.artistRepository.delete(artistId)
  }
}
