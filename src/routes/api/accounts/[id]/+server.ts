import { error, json, type RequestHandler } from '@sveltejs/kit'
import { omit } from 'ramda'
import { z } from 'zod'

import { db } from '$lib/server/db'
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

  const account = await db.accounts
    .update(id, {
      genreRelevanceFilter: data.genreRelevanceFilter,
      showTypeTags: data.showTypeTags,
      showRelevanceTags: data.showRelevanceTags,
      darkMode: data.darkMode,
      showNsfw: data.showNsfw,
    })
    .then((res) => omit(['password'], res))

  return json(account)
}
