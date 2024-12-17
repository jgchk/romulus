import { AuthenticationClient } from '@romulus/authentication'
import { AuthorizationClient } from '@romulus/authorization'
import { GenresClient } from '@romulus/genres'
import { UserSettingsClient } from '@romulus/user-settings'

import type { IDrizzleConnection as IAppDrizzleConnection } from '$lib/server/db/connection'
import type { ApiCommandService } from '$lib/server/features/api/commands/command-service'
import { ApiCompositionRoot } from '$lib/server/features/api/composition-root'
import type { ApiQueryService } from '$lib/server/features/api/queries/query-service'
import type { MusicCatalogCommandService } from '$lib/server/features/music-catalog/commands/command-service'
import { MusicCatalogCompositionRoot } from '$lib/server/features/music-catalog/composition-root'
import type { MusicCatalogQueryService } from '$lib/server/features/music-catalog/queries/query-service'

export class CompositionRoot {
  constructor(
    private apiBaseUrl: string,
    private _dbConnection: IAppDrizzleConnection,
    private sessionToken: string | undefined,
  ) {}

  private dbConnection(): IAppDrizzleConnection {
    return this._dbConnection
  }

  apiCommandService(): ApiCommandService {
    return new ApiCompositionRoot(this.dbConnection()).apiCommandService()
  }

  apiQueryService(): ApiQueryService {
    return new ApiCompositionRoot(this.dbConnection()).apiQueryService()
  }

  authentication() {
    return new AuthenticationClient(this.apiBaseUrl, this.sessionToken)
  }

  authorization() {
    return new AuthorizationClient(this.apiBaseUrl, this.sessionToken)
  }

  userSettings() {
    return new UserSettingsClient(this.apiBaseUrl, this.sessionToken)
  }

  genres() {
    return new GenresClient(this.apiBaseUrl, this.sessionToken)
  }

  musicCatalogCommandService(): MusicCatalogCommandService {
    return new MusicCatalogCompositionRoot(this.dbConnection()).musicCatalogCommandService()
  }

  musicCatalogQueryService(): MusicCatalogQueryService {
    return new MusicCatalogCompositionRoot(this.dbConnection()).musicCatalogQueryService()
  }
}
