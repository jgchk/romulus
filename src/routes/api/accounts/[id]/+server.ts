import { error, json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'

import { AccountNotFoundError } from '$lib/server/features/authentication/commands/application/errors/account-not-found'
import { genreRelevance } from '$lib/types/genres'

const schema = z.object({
  genreRelevanceFilter: genreRelevance.optional(),
  showTypeTags: z.boolean().optional(),
  showRelevanceTags: z.boolean().optional(),
  darkMode: z.boolean().optional(),
  showNsfw: z.boolean().optional(),
})

export const PATCH: RequestHandler = async ({ request, params, locals }) => {
  if (!locals.user) {
    return error(401, 'You must be logged in to do that')
  }

  const maybeId = z.coerce.number().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, 'Invalid account ID')
  }
  const id = maybeId.data

  if (id !== locals.user.id) {
    return error(403, 'You do not have permission to do that')
  }

  const maybeData = schema.safeParse(await request.json())
  if (!maybeData.success) {
    return json({ success: false, error: maybeData.error }, { status: 400 })
  }
  const data = maybeData.data

  const result = await locals.di.authenticationCommandService().updateUserSettings(id, {
    genreRelevanceFilter: data.genreRelevanceFilter,
    showTypeTags: data.showTypeTags,
    showRelevanceTags: data.showRelevanceTags,
    darkMode: data.darkMode,
    showNsfw: data.showNsfw,
  })
  if (result instanceof AccountNotFoundError) {
    return error(404, 'Account not found')
  }

  return json({ success: true })
}
