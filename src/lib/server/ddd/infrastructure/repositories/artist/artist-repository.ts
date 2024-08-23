import type { Artist } from '../../../domain/artist/artist'
import type { ArtistAggregate } from '../../../domain/artist/artist-aggregate'

export type ArtistRepository = {
  findById(id: number): Promise<Artist | null>
  findByName(name: string): Promise<Artist[]>
  save(artist: Artist): Promise<void>
  getAggregateById(id: number): Promise<ArtistAggregate | null>
  saveAggregate(aggregate: ArtistAggregate): Promise<void>
}
