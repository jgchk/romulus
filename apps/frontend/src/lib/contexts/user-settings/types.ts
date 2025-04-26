import type { Writable } from 'svelte/store'

export type UserSettings = {
  darkMode: boolean
  genreRelevanceFilter: number
  showRelevanceTags: boolean
  showTypeTags: boolean
  showNsfw: boolean
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  darkMode: true,
  genreRelevanceFilter: 0,
  showRelevanceTags: true,
  showTypeTags: true,
  showNsfw: false,
}

export type IUserSettingsStore = Writable<UserSettings>
