import type { IDrizzleConnection } from '$lib/server/db/connection'
import { artists } from '$lib/server/db/schema'

import type { Artist } from '../../domain/entities/artist'
import type { ArtistRepository } from './artist-repository'

export class DrizzleArtistRepository implements ArtistRepository {
  constructor(private db: IDrizzleConnection) {}

  async create(artist: Artist): Promise<number> {
    const artistId = await this.db.transaction(async (tx) => {
      const [{ artistId }] = await tx
        .insert(artists)
        .values({
          name: artist.name,
        })
        .returning({ artistId: artists.id })

      return artistId
    })

    return artistId
  }
}
