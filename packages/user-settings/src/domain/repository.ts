import type { MaybePromise } from '../utils'
import type { UserSettings } from './user-settings'

export type IUserSettingsRepository = {
  get(userId: number): MaybePromise<UserSettings>
  save(settings: UserSettings): MaybePromise<void>
}
