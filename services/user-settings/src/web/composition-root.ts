import { UserSettingsApplication } from '../application/index.js'
import type { IUserSettingsRepository } from '../domain/repository.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { DrizzleUserSettingsRepository } from '../infrastructure/drizzle-repository.js'

export class CompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

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
