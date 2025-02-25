import type { IUserSettingsRepository } from '../domain/repository.js'
import type { UserSettingsData } from '../domain/user-settings.js'

export type GetUserSettingsQuery = {
  userId: number
}

export class GetUserSettingsQueryHandler {
  constructor(private repo: IUserSettingsRepository) {}

  async handle(command: GetUserSettingsQuery): Promise<UserSettingsData> {
    const settings = await this.repo.get(command.userId)
    return settings.getSettings()
  }
}
