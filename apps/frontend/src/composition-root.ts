import { AuthenticationClient, type IAuthenticationClient } from '@romulus/authentication/client'
import { AuthorizationClient, type IAuthorizationClient } from '@romulus/authorization/client'
import { GenresClient, type IGenresClient } from '@romulus/genres/client'
import { type IUserSettingsClient, UserSettingsClient } from '@romulus/user-settings/client'

import type { IDrizzleConnection as IAppDrizzleConnection } from '$lib/server/db/connection'
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

  authentication(): IAuthenticationClient {
    return new AuthenticationClient(`${this.apiBaseUrl}/authentication`, this.sessionToken)
  }

  authorization(): IAuthorizationClient {
    return new AuthorizationClient(`${this.apiBaseUrl}/authorization`, this.sessionToken)
  }

  userSettings(): IUserSettingsClient {
    return new UserSettingsClient(`${this.apiBaseUrl}/user-settings`, this.sessionToken)
  }

  genres(): IGenresClient {
    return new GenresClient(`${this.apiBaseUrl}/genres`, this.sessionToken)
  }

  musicCatalogCommandService(): MusicCatalogCommandService {
    return new MusicCatalogCompositionRoot(this.dbConnection()).musicCatalogCommandService()
  }

  musicCatalogQueryService(): MusicCatalogQueryService {
    return new MusicCatalogCompositionRoot(this.dbConnection()).musicCatalogQueryService()
  }
}
