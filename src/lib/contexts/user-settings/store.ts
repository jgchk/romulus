import type { User } from 'lucia'
import { type Invalidator, type Subscriber, type Unsubscriber, type Updater } from 'svelte/store'

import { browser } from '$app/environment'

import { BaseUserSettingsStore } from './base-store'
import {
  DefaultUserSettingsRepository,
  LocalUserSettingsRepository,
  RemoteUserSettingsRepository,
} from './repository'
import { DEFAULT_USER_SETTINGS, type IUserSettingsStore, type UserSettings } from './types'

export default class UserSettingsStore implements IUserSettingsStore {
  store: BaseUserSettingsStore

  constructor(initialUser: User | undefined) {
    if (initialUser) {
      const repository = new RemoteUserSettingsRepository(initialUser.id)
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

  updateUser(user: User | undefined): void {
    if (user) {
      const repository = new RemoteUserSettingsRepository(user.id)
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

  subscribe(
    run: Subscriber<UserSettings>,
    invalidate?: Invalidator<UserSettings> | undefined,
  ): Unsubscriber {
    return this.store.subscribe(run, invalidate)
  }
}
