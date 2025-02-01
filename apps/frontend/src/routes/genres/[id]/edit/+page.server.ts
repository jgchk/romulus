import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { genreSchema } from '$lib/server/api/genres/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user?.permissions.genres.canEdit) {
    return error(403, { message: 'You do not have permission to edit genres' })
  }

  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const maybeGenre = await locals.di.genres().getGenre(id)
  if (maybeGenre.isErr()) {
    return error(
      maybeGenre.error.name === 'FetchError' ? 500 : maybeGenre.error.statusCode,
      maybeGenre.error.message,
    )
  }

  const { akas, ...genre } = maybeGenre.value.genre

  const data = {
    ...genre,
    parents: genre.parents.map((parent) => parent.id),
    derivedFrom: genre.derivedFrom.map((derivedFrom) => derivedFrom.id),
    influencedBy: genre.influencedBy.map((influencer) => influencer.id),
    primaryAkas: akas.primary.join(', '),
    secondaryAkas: akas.secondary.join(', '),
    tertiaryAkas: akas.tertiary.join(', '),
  }

  const form = await superValidate(data, zod(genreSchema))
  return { form }
}

export const actions: Actions = {
  default: async ({ params, request, locals }) => {
    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const updateResult = await locals.di.genres().updateGenre(id, form.data)
    if (updateResult.isErr()) {
      return error(
        updateResult.error.name === 'FetchError' ? 500 : updateResult.error.statusCode,
        updateResult.error.message,
      )
    }

    redirect(302, `/genres/${id}`)
  },
}
