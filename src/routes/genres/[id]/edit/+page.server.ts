import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { genreSchema } from '$lib/server/api/genres/types'
import { NotFoundError } from '$lib/server/features/genres/commands/application/commands/update-genre'
import { DuplicateAkaError } from '$lib/server/features/genres/commands/domain/errors/duplicate-aka'
import { GenreCycleError } from '$lib/server/features/genres/commands/domain/errors/genre-cycle'
import { SelfInfluenceError } from '$lib/server/features/genres/commands/domain/errors/self-influence'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user?.permissions?.includes('EDIT_GENRES')) {
    return error(403, { message: 'You do not have permission to edit genres' })
  }

  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const maybeGenre = await locals.services.genre.queries.getGenre(id)
  if (!maybeGenre) {
    return error(404, { message: 'Genre not found' })
  }

  const { akas, ...genre } = maybeGenre

  const data = {
    ...genre,
    parents: genre.parents.map((parent) => parent.id),
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
    if (!locals.user?.permissions?.includes('EDIT_GENRES')) {
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

    const genreUpdate = {
      ...form.data,
      parents: new Set(form.data.parents),
      influences: new Set(form.data.influencedBy),
      akas: {
        primary: form.data.primaryAkas?.length
          ? form.data.primaryAkas?.split(',').map((aka) => aka.trim())
          : [],
        secondary: form.data.secondaryAkas?.length
          ? form.data.secondaryAkas?.split(',').map((aka) => aka.trim())
          : [],
        tertiary: form.data.tertiaryAkas?.length
          ? form.data.tertiaryAkas?.split(',').map((aka) => aka.trim())
          : [],
      },
    }

    try {
      const updateResult = await locals.services.genre.commands.updateGenre(
        id,
        genreUpdate,
        user.id,
      )
      if (updateResult instanceof SelfInfluenceError) {
        return setError(form, 'influencedBy._errors', 'A genre cannot influence itself')
      } else if (updateResult instanceof GenreCycleError) {
        return setError(form, 'parents._errors', updateResult.message)
      }
    } catch (e) {
      if (e instanceof NotFoundError) {
        return error(404, { message: 'Genre not found' })
      } else if (e instanceof DuplicateAkaError) {
        return setError(form, getDuplicateAkaErrorField(e.level), e.message)
      } else {
        throw e
      }
    }

    redirect(302, `/genres/${id}`)
  },
}

function getDuplicateAkaErrorField(level: DuplicateAkaError['level']) {
  switch (level) {
    case 'primary':
      return 'primaryAkas' as const
    case 'secondary':
      return 'secondaryAkas' as const
    case 'tertiary':
      return 'tertiaryAkas' as const
  }
}
