import { error, json, type RequestHandler } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '$lib/server/db'
import { accounts } from '$lib/server/db/schema'
import { genreRelevance } from '$lib/types/genres'
import { hasUpdate, makeUpdate } from '$lib/utils/db'
import { omit } from '$lib/utils/object'

const schema = z.object({
  genreRelevanceFilter: genreRelevance.optional(),
  showTypeTags: z.boolean().optional(),
  showRelevanceTags: z.boolean().optional(),
  darkMode: z.boolean().optional(),
})

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return error(401, 'You must be logged in to do that')
  }

  const maybeData = schema.safeParse(await request.json())
  if (!maybeData.success) {
    return json({ success: false, error: maybeData.error }, { status: 400 })
  }
  const data = maybeData.data

  const updates = makeUpdate(data)

  let account
  if (hasUpdate(updates)) {
    account = await db
      .update(accounts)
      .set({
        genreRelevanceFilter: data.genreRelevanceFilter,
        showTypeTags: data.showTypeTags,
        showRelevanceTags: data.showRelevanceTags,
        darkMode: data.darkMode,
      })
      .where(eq(accounts.id, locals.user.id))
      .returning()
      .then((res) => omit(res[0], ['password']))
  } else {
    account = locals.user
  }

  return json(account)
}
