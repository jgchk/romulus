import { UserSettingsApplication } from '../application'
import type { IAuthenticationService } from '../domain/authentication-service'
import type { IUserSettingsRepository } from '../domain/repository'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import { DrizzleUserSettingsRepository } from '../infrastructure/drizzle-repository'

export class CompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _authenticationService: IAuthenticationService,
  ) {}

  authentication(): IAuthenticationService {
    return this._authenticationService
  }

  application(): UserSettingsApplication {
    return new UserSettingsApplication(this.userSettingsRepository())
  }

  private userSettingsRepository(): IUserSettingsRepository {
    return new DrizzleUserSettingsRepository(this.dbConnection())
  }

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }
}
