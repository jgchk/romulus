import type { User } from 'lucia'
import { derived, writable } from 'svelte/store'

export const user = writable<User | undefined>()

export const userSettings = derived(user, ($user) => ({
  darkMode: $user?.darkMode ?? true,
  genreRelevanceFilter: $user?.genreRelevanceFilter ?? 0,
  showRelevanceTags: $user?.showRelevanceTags ?? false,
  showTypeTags: $user?.showTypeTags ?? true,
}))
