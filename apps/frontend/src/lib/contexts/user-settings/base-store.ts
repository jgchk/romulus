import {
  get,
  type Subscriber,
  type Unsubscriber,
  type Updater,
  type Writable,
  writable,
} from 'svelte/store'

import { type UserSettingsRepository } from './repository'
import { type UserSettings } from './types'

export class BaseUserSettingsStore implements Writable<UserSettings> {
  store: Writable<UserSettings>
  repository: UserSettingsRepository

  constructor(initialValue: UserSettings, repository: UserSettingsRepository) {
    this.store = writable(initialValue)
    this.repository = repository
  }

  set(value: UserSettings): void {
    const previousValue = get(this.store)
    this.store.set(value)
    void this.repository.save(value).catch(() => {
      this.store.set(previousValue)
    })
  }

  update(updater: Updater<UserSettings>): void {
    this.store.update((currentValue) => {
      const newValue = updater(currentValue)
      void this.repository.save(newValue).catch(() => {
        this.store.set(currentValue)
      })
      return newValue
    })
  }

  subscribe(run: Subscriber<UserSettings>, invalidate?: () => void): Unsubscriber {
    return this.store.subscribe(run, invalidate)
  }

  setRepository(repository: UserSettingsRepository): void {
    this.repository = repository
  }
}
