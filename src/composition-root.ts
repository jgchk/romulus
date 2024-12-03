import type { IDrizzleConnection } from '$lib/server/db/connection'
import type { ApiCommandService } from '$lib/server/features/api/commands/command-service'
import { ApiCompositionRoot } from '$lib/server/features/api/composition-root'
import type { ApiQueryService } from '$lib/server/features/api/queries/query-service'
import type { AuthenticationCommandService } from '$lib/server/features/authentication/commands/command-service'
import type { AuthenticationController } from '$lib/server/features/authentication/commands/presentation/controllers'
import { AuthenticationCompositionRoot } from '$lib/server/features/authentication/composition-root'
import type { AuthenticationQueryService } from '$lib/server/features/authentication/queries/query-service'
import type { GenreCommandService } from '$lib/server/features/genres/commands/command-service'
import { GenresCompositionRoot } from '$lib/server/features/genres/composition-root'
import type { GenreQueryService } from '$lib/server/features/genres/queries/query-service'
import type { MusicCatalogCommandService } from '$lib/server/features/music-catalog/commands/command-service'
import { MusicCatalogCompositionRoot } from '$lib/server/features/music-catalog/composition-root'
import type { MusicCatalogQueryService } from '$lib/server/features/music-catalog/queries/query-service'

export class CompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _sessionCookieName: string,
  ) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  apiCommandService(): ApiCommandService {
    return new ApiCompositionRoot(this.dbConnection()).apiCommandService()
  }

  apiQueryService(): ApiQueryService {
    return new ApiCompositionRoot(this.dbConnection()).apiQueryService()
  }

  authenticationCommandService(): AuthenticationCommandService {
    return new AuthenticationCompositionRoot(
      this.dbConnection(),
      this._sessionCookieName,
    ).authenticationCommandService()
  }

  authenticationQueryService(): AuthenticationQueryService {
    return new AuthenticationCompositionRoot(
      this.dbConnection(),
      this._sessionCookieName,
    ).authenticationQueryService()
  }

  authenticationController(): AuthenticationController {
    return new AuthenticationCompositionRoot(
      this.dbConnection(),
      this._sessionCookieName,
    ).authenticationController()
  }

  genreCommandService(): GenreCommandService {
    return new GenresCompositionRoot(this.dbConnection()).genreCommandService()
  }

  genreQueryService(): GenreQueryService {
    return new GenresCompositionRoot(this.dbConnection()).genreQueryService()
  }

  musicCatalogCommandService(): MusicCatalogCommandService {
    return new MusicCatalogCompositionRoot(this.dbConnection()).musicCatalogCommandService()
  }

  musicCatalogQueryService(): MusicCatalogQueryService {
    return new MusicCatalogCompositionRoot(this.dbConnection()).musicCatalogQueryService()
  }
}
