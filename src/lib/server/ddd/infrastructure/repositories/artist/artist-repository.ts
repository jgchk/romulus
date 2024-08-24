import type { Artist } from '$lib/server/ddd/domain/artist'

export type ArtistRepository = {
  create(release: Artist): Promise<number>
}
