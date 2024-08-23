import type { Artist } from '../../../domain/artist/artist'

export type ArtistRepository = {
  findById(id: number): Promise<Artist | null>
  findByName(name: string): Promise<Artist[]>
  save(artist: Artist): Promise<void>
}
