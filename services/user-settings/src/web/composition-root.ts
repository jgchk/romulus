import type { IAuthenticationApplication } from '@romulus/authentication'

import { UserSettingsApplication } from '../application'
import type { IUserSettingsRepository } from '../domain/repository'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import { DrizzleUserSettingsRepository } from '../infrastructure/drizzle-repository'

export class CompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _authentication: IAuthenticationApplication,
  ) {}

  authentication(): IAuthenticationApplication {
    return this._authentication
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
