import { Artist } from '../domain/entities/artist'
import type { ArtistRepository } from '../domain/repositories/artist-repository'

export class CreateArtistCommand {
  constructor(private artistRepo: ArtistRepository) {}

  async execute(name: string): Promise<number> {
    const artist = new Artist(name)

    const artistId = await this.artistRepo.create(artist)

    return artistId
  }
}
