import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { genreSchema } from '$lib/server/api/genres/types'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user?.permissions.genres.canCreate) {
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
    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const createResult = await locals.di.genres().commands().createGenre(form.data)
    if (createResult instanceof Error) {
      return error(createResult.originalError.statusCode, createResult.message)
    }

    const relevance = form.data.relevance
    if (relevance !== undefined) {
      const voteResult = await locals.di
        .genres()
        .commands()
        .voteGenreRelevance(createResult.id, relevance)

      if (voteResult instanceof Error) {
        return error(voteResult.originalError.statusCode, voteResult.message)
      }
    }

    redirect(302, `/genres/${createResult.id}`)
  },
}
