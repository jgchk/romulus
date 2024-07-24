import {
  get,
  type Invalidator,
  type Subscriber,
  type Unsubscriber,
  type Updater,
  type Writable,
} from 'svelte/store'

import { browser } from '$app/environment'

import { user } from '../user'
import { BaseUserSettingsStore } from './base-store'
import {
  DefaultUserSettingsRepository,
  LocalUserSettingsRepository,
  RemoteUserSettingsRepository,
} from './repository'
import { DEFAULT_USER_SETTINGS, type UserSettings } from './types'

export default class UserSettingsStore implements Writable<UserSettings> {
  store: BaseUserSettingsStore

  constructor() {
    const userValue = get(user)
    if (userValue) {
      const repository = new RemoteUserSettingsRepository(userValue.id)
      this.store = new BaseUserSettingsStore(userValue, repository)
    } else if (browser) {
      const repository = new LocalUserSettingsRepository(localStorage)
      const initialValue = repository.get()
      this.store = new BaseUserSettingsStore(initialValue, repository)
    } else {
      const repository = new DefaultUserSettingsRepository()
      this.store = new BaseUserSettingsStore(DEFAULT_USER_SETTINGS, repository)
    }

    user.subscribe((value) => {
      if (value) {
        const repository = new RemoteUserSettingsRepository(value.id)
        this.store.setRepository(repository)
        this.store.set(value)
      } else if (browser) {
        const repository = new LocalUserSettingsRepository(localStorage)
        const currentValue = repository.get()
        this.store.setRepository(repository)
        this.store.set(currentValue)
      } else {
        const repository = new DefaultUserSettingsRepository()
        this.store.setRepository(repository)
        this.store.set(DEFAULT_USER_SETTINGS)
      }
    })
  }

  set(value: UserSettings): void {
    this.store.set(value)
  }

  update(updater: Updater<UserSettings>): void {
    this.store.update(updater)
  }

  subscribe(
    run: Subscriber<UserSettings>,
    invalidate?: Invalidator<UserSettings> | undefined,
  ): Unsubscriber {
    return this.store.subscribe(run, invalidate)
  }
}
