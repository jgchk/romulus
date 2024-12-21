import { AuthenticationClient, type IAuthenticationClient } from '@romulus/authentication/client'
import { AuthorizationClient, type IAuthorizationClient } from '@romulus/authorization/client'
import { GenresClient, type IGenresClient } from '@romulus/genres/client'
import { type IUserSettingsClient, UserSettingsClient } from '@romulus/user-settings/client'

export class CompositionRoot {
  constructor(
    private apiBaseUrl: string,
    private sessionToken: string | undefined,
  ) {}

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
}
