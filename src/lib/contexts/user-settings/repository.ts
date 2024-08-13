import { DEFAULT_USER_SETTINGS, type UserSettings } from './types'

export type UserSettingsRepository = {
  save(settings: UserSettings): Promise<void>
}

export class RemoteUserSettingsRepository implements UserSettingsRepository {
  accountId: number

  constructor(accountId: number) {
    this.accountId = accountId
  }

  async save(settings: UserSettings): Promise<void> {
    await fetch(`/api/accounts/${this.accountId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
  }
}

export class LocalUserSettingsRepository implements UserSettingsRepository {
  storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  get(): UserSettings {
    const settings = this.storage.getItem('userSettings')
    if (settings) {
      return JSON.parse(settings) as UserSettings
    } else {
      return DEFAULT_USER_SETTINGS
    }
  }

  save(settings: UserSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.storage.setItem('userSettings', JSON.stringify(settings))
        resolve()
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(error)
      }
    })
  }
}

export class DefaultUserSettingsRepository implements UserSettingsRepository {
  save(): Promise<void> {
    return Promise.resolve()
  }
}
