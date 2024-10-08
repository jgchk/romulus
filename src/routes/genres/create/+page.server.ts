import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { createGenre } from '$lib/server/api/genres/create'
import { genreSchema } from '$lib/server/api/genres/types'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user?.permissions?.includes('EDIT_GENRES')) {
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
    if (!locals.user?.permissions?.includes('EDIT_GENRES')) {
      return error(403, { message: 'You do not have permission to create genres' })
    }
    const user = locals.user

    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const genreId = await createGenre(form.data, user.id, locals.dbConnection)

    redirect(302, `/genres/${genreId}`)
  },
}
