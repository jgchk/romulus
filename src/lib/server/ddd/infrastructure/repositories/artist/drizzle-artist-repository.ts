import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'

import * as schema from '../../../../db/schema'
import { Artist } from '../../../domain/artist/artist'
import type { ArtistRepository } from './artist-repository'

export class DrizzleArtistRepository implements ArtistRepository {
  constructor(private db: IDrizzleConnection) {}

  async findById(id: number): Promise<Artist | null> {
    const result = await this.db.select().from(schema.artists).where(eq(schema.artists.id, id))
    if (result.length === 0) return null
    return new Artist(result[0].id, result[0].name)
  }

  async findByName(name: string): Promise<Artist[]> {
    const results = await this.db.select().from(schema.artists).where(eq(schema.artists.name, name))
    return results.map((row) => new Artist(row.id, row.name))
  }

  async save(artist: Artist): Promise<void> {
    if (artist.id === 0) {
      const [result] = await this.db
        .insert(schema.artists)
        .values({ name: artist.name })
        .returning()
      artist.id = result.id
    } else {
      await this.db
        .update(schema.artists)
        .set({ name: artist.name })
        .where(eq(schema.artists.id, artist.id))
    }
  }
}
