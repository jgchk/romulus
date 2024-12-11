import type { IUserSettingsRepository } from '../domain/repository'
import type { GetUserSettingsQuery } from './get-user-settings'
import { GetUserSettingsQueryHandler } from './get-user-settings'
import type { UpdateUserSettingsCommand } from './update-user-settings'
import { UpdateUserSettingsCommandHandler } from './update-user-settings'

export class UserSettingsApplication {
  private getUserSettingsQueryHandler: GetUserSettingsQueryHandler
  private updateUserSettingsCommandHandler: UpdateUserSettingsCommandHandler

  constructor(repo: IUserSettingsRepository) {
    this.getUserSettingsQueryHandler = new GetUserSettingsQueryHandler(repo)
    this.updateUserSettingsCommandHandler = new UpdateUserSettingsCommandHandler(repo)
  }

  getUserSettings(query: GetUserSettingsQuery) {
    return this.getUserSettingsQueryHandler.handle(query)
  }

  updateUserSettings(command: UpdateUserSettingsCommand) {
    return this.updateUserSettingsCommandHandler.handle(command)
  }
}
