import type { Artist } from '../aggregates/artist'

export type ArtistRepository = {
  create(artist: Artist): Promise<number>
  delete(artistId: number): Promise<void>
}
