import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { genreSchema } from '$lib/server/db/utils'
import { createGenre, GenreCycleError, setRelevanceVote } from '$lib/server/genres'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
    return error(403, { message: 'You do not have permission to create genres' })
  }

  const form = await superValidate(
    { type: 'STYLE', relevance: UNSET_GENRE_RELEVANCE },
    zod(genreSchema),
    { errors: false },
  )
  return { form }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
      return error(403, { message: 'You do not have permission to create genres' })
    }
    const user = locals.user

    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      const genre = await createGenre(form.data, user.id)
      if (form.data.relevance !== undefined) {
        await setRelevanceVote(genre.id, form.data.relevance, user.id)
      }
      redirect(302, `/genres/${genre.id}`)
    } catch (err) {
      if (err instanceof GenreCycleError) {
        return setError(form, 'parents._errors', `Cycle detected: ${err.cycle}`)
      } else {
        throw err
      }
    }
  },
}
