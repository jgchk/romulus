import type { Subscriber, Unsubscriber, Updater } from 'svelte/store'

import { browser } from '$app/environment'

import { BaseUserSettingsStore } from './base-store'
import {
  DefaultUserSettingsRepository,
  LocalUserSettingsRepository,
  RemoteUserSettingsRepository,
} from './repository'
import type { IUserSettingsStore, UserSettings } from './types'
import { DEFAULT_USER_SETTINGS } from './types'

export default class UserSettingsStore implements IUserSettingsStore {
  store: BaseUserSettingsStore

  constructor(initialUser: UserSettings | undefined) {
    if (initialUser) {
      const repository = new RemoteUserSettingsRepository()
      this.store = new BaseUserSettingsStore(initialUser, repository)
    } else if (browser) {
      const repository = new LocalUserSettingsRepository(localStorage)
      const initialValue = repository.get()
      this.store = new BaseUserSettingsStore(initialValue, repository)
    } else {
      const repository = new DefaultUserSettingsRepository()
      this.store = new BaseUserSettingsStore(DEFAULT_USER_SETTINGS, repository)
    }
  }

  updateUser(user: UserSettings | undefined): void {
    if (user) {
      const repository = new RemoteUserSettingsRepository()
      this.store.setRepository(repository)
      this.store.set(user)
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
  }

  set(value: UserSettings): void {
    this.store.set(value)
  }

  update(updater: Updater<UserSettings>): void {
    this.store.update(updater)
  }

  subscribe(run: Subscriber<UserSettings>, invalidate?: () => void): Unsubscriber {
    return this.store.subscribe(run, invalidate)
  }
}
