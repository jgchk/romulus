import type { Artist } from '$lib/server/ddd/domain/artist'

export type ArtistRepository = {
  create(artist: Artist): Promise<number>
}
