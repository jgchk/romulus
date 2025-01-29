import { AuthenticationClient } from '@romulus/authentication/client'
import { AuthorizationClient } from '@romulus/authorization/client'
import { GenresClient, type IGenresClient } from '@romulus/genres/client'
import { type IUserSettingsClient, UserSettingsClient } from '@romulus/user-settings/client'

export class CompositionRoot {
  constructor(
    private apiBaseUrl: string,
    private sessionToken: string | undefined,
  ) {}

  authentication() {
    return new AuthenticationClient(`${this.apiBaseUrl}/authentication`, this.sessionToken)
  }

  authorization() {
    return new AuthorizationClient(`${this.apiBaseUrl}/authorization`, this.sessionToken)
  }

  userSettings(): IUserSettingsClient {
    return new UserSettingsClient(`${this.apiBaseUrl}/user-settings`, this.sessionToken)
  }

  genres(): IGenresClient {
    return new GenresClient(`${this.apiBaseUrl}/genres`, this.sessionToken)
  }
}
