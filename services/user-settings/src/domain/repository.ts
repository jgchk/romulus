import type { MaybePromise } from '../utils.js'
import type { UserSettings } from './user-settings.js'

export type IUserSettingsRepository = {
  get(userId: number): MaybePromise<UserSettings>
  save(settings: UserSettings): MaybePromise<void>
}
