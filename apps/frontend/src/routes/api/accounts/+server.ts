import { UserSettingsClientError } from '@romulus/user-settings/client'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'

import { genreRelevance, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

const schema = z.object({
  genreRelevanceFilter: genreRelevance,
  showTypeTags: z.boolean(),
  showRelevanceTags: z.boolean(),
  darkMode: z.boolean(),
  showNsfw: z.boolean(),
})

export const PUT: RequestHandler = async ({ request, locals }) => {
  const maybeData = schema.safeParse(await request.json())
  if (!maybeData.success) {
    return json({ success: false, error: maybeData.error }, { status: 400 })
  }
  const data = maybeData.data

  const result = await locals.di.userSettings().updateUserSettings({
    genreRelevanceFilter:
      data.genreRelevanceFilter === UNSET_GENRE_RELEVANCE ? undefined : data.genreRelevanceFilter,
    showTypeTags: data.showTypeTags,
    showRelevanceTags: data.showRelevanceTags,
    darkMode: data.darkMode,
    showNsfw: data.showNsfw,
  })
  if (result instanceof UserSettingsClientError) {
    return error(result.originalError.statusCode, result.message)
  }

  return json({ success: true })
}
