import type { Artist } from '../entities/artist'

export type ArtistRepository = {
  create(artist: Artist): Promise<number>
}
