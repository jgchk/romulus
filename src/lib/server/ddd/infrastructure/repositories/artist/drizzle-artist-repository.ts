import { and, eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'

import * as schema from '../../../../db/schema'
import { Artist } from '../../../domain/artist/artist'
import { ArtistAggregate } from '../../../domain/artist/artist-aggregate'
import { Order } from '../../../domain/common/value-objects'
import { Release } from '../../../domain/release/release'
import { Track } from '../../../domain/track/track'
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

  async getAggregateById(id: number): Promise<ArtistAggregate | null> {
    const artist = await this.findById(id)
    if (!artist) return null

    const aggregate = new ArtistAggregate(artist)

    // Fetch releases
    const releaseResults = await this.db
      .select({
        releaseId: schema.releases.id,
        releaseTitle: schema.releases.title,
        releaseArt: schema.releases.art,
        order: schema.releaseArtists.order,
      })
      .from(schema.releaseArtists)
      .innerJoin(schema.releases, eq(schema.releaseArtists.releaseId, schema.releases.id))
      .where(eq(schema.releaseArtists.artistId, id))

    for (const row of releaseResults) {
      const release = new Release(row.releaseId, row.releaseTitle, row.releaseArt ?? undefined)
      aggregate.addRelease(release, new Order(row.order))
    }

    // Fetch tracks
    const trackResults = await this.db
      .select({
        trackId: schema.tracks.id,
        trackTitle: schema.tracks.title,
        order: schema.trackArtists.order,
      })
      .from(schema.trackArtists)
      .innerJoin(schema.tracks, eq(schema.trackArtists.trackId, schema.tracks.id))
      .where(eq(schema.trackArtists.artistId, id))

    for (const row of trackResults) {
      const track = new Track(row.trackId, row.trackTitle)
      aggregate.addTrack(track, new Order(row.order))
    }

    return aggregate
  }

  async saveAggregate(aggregate: ArtistAggregate): Promise<void> {
    // Save the artist
    await this.save(aggregate.artist)

    // Save release associations
    const existingReleases = await this.db
      .select({
        releaseId: schema.releaseArtists.releaseId,
      })
      .from(schema.releaseArtists)
      .where(eq(schema.releaseArtists.artistId, aggregate.artist.id))

    const existingReleaseIds = new Set(existingReleases.map((r) => r.releaseId))
    const currentReleaseIds = new Set(aggregate.getReleases().map(([id]) => id))

    // Remove associations that no longer exist
    for (const releaseId of existingReleaseIds) {
      if (!currentReleaseIds.has(releaseId)) {
        await this.db
          .delete(schema.releaseArtists)
          .where(
            and(
              eq(schema.releaseArtists.artistId, aggregate.artist.id),
              eq(schema.releaseArtists.releaseId, releaseId),
            ),
          )
      }
    }

    // Add or update current associations
    for (const [releaseId, order] of aggregate.getReleases()) {
      if (existingReleaseIds.has(releaseId)) {
        await this.db
          .update(schema.releaseArtists)
          .set({ order: order.value })
          .where(
            and(
              eq(schema.releaseArtists.artistId, aggregate.artist.id),
              eq(schema.releaseArtists.releaseId, releaseId),
            ),
          )
      } else {
        await this.db
          .insert(schema.releaseArtists)
          .values({ artistId: aggregate.artist.id, releaseId, order: order.value })
      }
    }

    // Save track associations (similar to release associations)
    const existingTracks = await this.db
      .select({
        trackId: schema.trackArtists.trackId,
      })
      .from(schema.trackArtists)
      .where(eq(schema.trackArtists.artistId, aggregate.artist.id))

    const existingTrackIds = new Set(existingTracks.map((t) => t.trackId))
    const currentTrackIds = new Set(aggregate.getTracks().map(([id]) => id))

    for (const trackId of existingTrackIds) {
      if (!currentTrackIds.has(trackId)) {
        await this.db
          .delete(schema.trackArtists)
          .where(
            and(
              eq(schema.trackArtists.artistId, aggregate.artist.id),
              eq(schema.trackArtists.trackId, trackId),
            ),
          )
      }
    }

    for (const [trackId, order] of aggregate.getTracks()) {
      if (existingTrackIds.has(trackId)) {
        await this.db
          .update(schema.trackArtists)
          .set({ order: order.value })
          .where(
            and(
              eq(schema.trackArtists.artistId, aggregate.artist.id),
              eq(schema.trackArtists.trackId, trackId),
            ),
          )
      } else {
        await this.db
          .insert(schema.trackArtists)
          .values({ artistId: aggregate.artist.id, trackId, order: order.value })
      }
    }
  }
}
