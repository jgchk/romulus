import type { Artist } from '../../domain/artist'

export type ArtistRepository = {
  create(artist: Artist): Promise<number>
}
