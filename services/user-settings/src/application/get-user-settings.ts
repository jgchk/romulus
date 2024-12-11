import type { IUserSettingsRepository } from '../domain/repository'
import type { UserSettingsData } from '../domain/user-settings'

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
