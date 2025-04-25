import { DEFAULT_USER_SETTINGS, type UserSettings } from '$lib/contexts/user-settings/types'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { type LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = locals.user

  async function getUserSettings(): Promise<UserSettings> {
    if (user === undefined) return DEFAULT_USER_SETTINGS

    const settingsResponse = await locals.di.userSettings().getUserSettings()
    if (settingsResponse instanceof Error) {
      return DEFAULT_USER_SETTINGS
    }

    return {
      ...settingsResponse.settings,
      genreRelevanceFilter: settingsResponse.settings.genreRelevanceFilter ?? UNSET_GENRE_RELEVANCE,
    }
  }

  const settings = await getUserSettings()

  return { user, settings }
}
