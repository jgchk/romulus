import type { IDrizzleConnection } from '$lib/server/db/connection'

import { MusicCatalogCommandService } from './commands/command-service'
import type { ArtistRepository } from './commands/domain/repositories/artist-repository'
import type { ReleaseIssueRepository } from './commands/domain/repositories/release-issue-repository'
import type { ReleaseRepository } from './commands/domain/repositories/release-repository'
import type { TrackRepository } from './commands/domain/repositories/track-repository'
import { DrizzleArtistRepository } from './commands/infrastructure/artist/drizzle-artist-repository'
import { DrizzleReleaseRepository } from './commands/infrastructure/release/drizzle-release-repository'
import { DrizzleReleaseIssueRepository } from './commands/infrastructure/release-issue/drizzle-release-issue-repository'
import { DrizzleTrackRepository } from './commands/infrastructure/track/drizzle-track-repository'
import { MusicCatalogQueryService } from './queries/query-service'

export class MusicCatalogCompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  musicCatalogCommandService(): MusicCatalogCommandService {
    return new MusicCatalogCommandService(
      this.artistRepository(),
      this.releaseRepository(),
      this.releaseIssueRepository(),
      this.trackRepository(),
    )
  }

  musicCatalogQueryService(): MusicCatalogQueryService {
    return new MusicCatalogQueryService(this.dbConnection())
  }

  private artistRepository(): ArtistRepository {
    return new DrizzleArtistRepository(this.dbConnection())
  }

  private releaseRepository(): ReleaseRepository {
    return new DrizzleReleaseRepository(this.dbConnection())
  }

  private releaseIssueRepository(): ReleaseIssueRepository {
    return new DrizzleReleaseIssueRepository(this.dbConnection())
  }

  private trackRepository(): TrackRepository {
    return new DrizzleTrackRepository(this.dbConnection())
  }
}
