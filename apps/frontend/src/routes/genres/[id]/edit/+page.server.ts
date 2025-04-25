import { type GenresClient } from '@romulus/genres/client'
import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { genreSchema } from '$lib/server/api/genres/types'

import { type Actions, type PageServerLoad } from './$types'

export const load = (async ({
  locals,
  params,
}: {
  locals: {
    di: { genres: () => { getGenre: GenresClient['getGenre'] } }
    user?: { permissions: { genres: { canEdit: boolean } } }
  }
  params: { id: string }
}) => {
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
    switch (maybeGenre.error.name) {
      case 'FetchError': {
        return error(500, maybeGenre.error.message)
      }
      case 'ValidationError': {
        return error(400, { message: maybeGenre.error.message })
      }
      case 'GenreNotFoundError': {
        return error(404, maybeGenre.error.message)
      }
    }
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
}) satisfies PageServerLoad

export const actions = {
  default: async ({
    params,
    request,
    locals,
  }: {
    params: { id: string }
    request: Request
    locals: { di: { genres: () => { updateGenre: GenresClient['updateGenre'] } } }
  }) => {
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
      switch (updateResult.error.name) {
        case 'FetchError': {
          return error(500, updateResult.error.message)
        }
        case 'ValidationError': {
          for (const issue of updateResult.error.details.issues) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError(form, issue.path as any, issue.message)
          }
          return fail(400, { form })
        }
        case 'GenreNotFoundError': {
          return error(404, updateResult.error.message)
        }
        case 'DuplicateAkaError': {
          return setError(
            form,
            `${updateResult.error.details.level}Akas`,
            updateResult.error.message,
          )
        }
        case 'DerivedChildError':
        case 'DerivedInfluenceError': {
          return setError(form, 'derivedFrom._errors', updateResult.error.message)
        }
        case 'SelfInfluenceError': {
          return setError(form, 'influencedBy._errors', updateResult.error.message)
        }
        case 'GenreCycleError': {
          return setError(form, 'parents._errors', updateResult.error.message)
        }
        case 'UnauthenticatedError':
        case 'UnauthorizedError': {
          return error(updateResult.error.statusCode, updateResult.error.message)
        }
        default: {
          updateResult.error satisfies never
          return error(500, 'An unknown error occurred')
        }
      }
    }

    redirect(302, `/genres/${id}`)
  },
} satisfies Actions
