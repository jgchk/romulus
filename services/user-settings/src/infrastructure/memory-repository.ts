import type { IUserSettingsRepository } from '../domain/repository'
import type { UserSettingsData } from '../domain/user-settings'
import { UserSettings } from '../domain/user-settings'

export class MemoryUserSettingsRepository implements IUserSettingsRepository {
  private settings = new Map<number, UserSettingsData>()

  get(userId: number) {
    const settings = this.settings.get(userId)
    if (settings) {
      return UserSettings.fromData(userId, settings)
    } else {
      return UserSettings.default(userId)
    }
  }

  save(settings: UserSettings) {
    this.settings.set(settings.getUserId(), settings.getSettings())
  }
}
