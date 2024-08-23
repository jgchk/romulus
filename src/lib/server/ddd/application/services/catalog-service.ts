import { Order } from '../../domain/common/value-objects'
import { Release } from '../../domain/release/release'
import { Track } from '../../domain/track/track'
import type { ArtistRepository } from '../../infrastructure/repositories/artist/artist-repository'
import type { ReleaseRepository } from '../../infrastructure/repositories/release/release-repository'
import type { TrackRepository } from '../../infrastructure/repositories/track/track-repository'

export class MusicCatalogService {
  constructor(
    private artistRepo: ArtistRepository,
    private releaseRepo: ReleaseRepository,
    private trackRepo: TrackRepository,
  ) {}
}
