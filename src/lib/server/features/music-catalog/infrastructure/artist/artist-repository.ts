import type { Artist } from '../../domain/entities/artist'

export type ArtistRepository = {
  create(artist: Artist): Promise<number>
}
