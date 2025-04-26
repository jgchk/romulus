import { getContext, setContext } from 'svelte'

import type { IUserSettingsStore } from './types'

export const USER_SETTINGS_CONTEXT_KEY = Symbol('user-settings-context')

export const setUserSettingsContext = (value: IUserSettingsStore) =>
  setContext(USER_SETTINGS_CONTEXT_KEY, value)

export const getUserSettingsContext = () =>
  getContext<IUserSettingsStore>(USER_SETTINGS_CONTEXT_KEY)
