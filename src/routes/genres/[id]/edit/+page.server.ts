import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { genreSchema, NotFoundError } from '$lib/server/api/genres/types'
import {
  GenreCycleError,
  NoUpdatesError,
  SelfInfluenceError,
  updateGenre,
} from '$lib/server/api/genres/update'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
    return error(403, { message: 'You do not have permission to edit genres' })
  }

  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const genresDb = new GenresDatabase()
  const maybeGenre = await genresDb.findByIdEdit(id, locals.dbConnection)
  if (!maybeGenre) {
    return error(404, { message: 'Genre not found' })
  }

  const { akas, ...genre } = maybeGenre

  const data = {
    ...genre,
    primaryAkas: akas
      .filter((aka) => aka.relevance === 3)
      .map((aka) => aka.name)
      .join(', '),
    secondaryAkas: akas
      .filter((aka) => aka.relevance === 2)
      .map((aka) => aka.name)
      .join(', '),
    tertiaryAkas: akas
      .filter((aka) => aka.relevance === 1)
      .map((aka) => aka.name)
      .join(', '),
  }

  const form = await superValidate(data, zod(genreSchema))
  return { form }
}

export const actions: Actions = {
  default: async ({ params, request, locals }) => {
    if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
      return error(403, { message: 'You do not have permission to edit genres' })
    }
    const user = locals.user

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      await updateGenre(id, form.data, user.id, {
        transactor: locals.dbConnection,
        genresDb: new GenresDatabase(),
        genreHistoryDb: new GenreHistoryDatabase(),
      })
    } catch (e) {
      if (e instanceof NotFoundError) {
        return error(404, { message: 'Genre not found' })
      } else if (e instanceof GenreCycleError) {
        return setError(form, 'parents._errors', `Cycle detected: ${e.cycle}`)
      } else if (e instanceof SelfInfluenceError) {
        return setError(form, 'influencedBy._errors', 'A genre cannot influence itself')
      } else if (e instanceof NoUpdatesError) {
        return redirect(302, `/genres/${id}`)
      } else {
        throw e
      }
    }

    redirect(302, `/genres/${id}`)
  },
}
