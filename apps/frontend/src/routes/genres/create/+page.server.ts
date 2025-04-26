import type { GenresClient } from '@romulus/genres/client'
import type { Actions } from '@sveltejs/kit'
import { error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { genreSchema } from '$lib/server/api/genres/types'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { PageServerLoad } from './$types'

export const load = (async ({
  locals,
}: {
  locals: { user?: { permissions: { genres: { canCreate: boolean } } } }
}) => {
  if (!locals.user?.permissions.genres.canCreate) {
    return error(403, { message: 'You do not have permission to create genres' })
  }

  const form = await superValidate(
    { type: 'STYLE', relevance: UNSET_GENRE_RELEVANCE },
    zod(genreSchema),
    { errors: false },
  )
  return { form }
}) satisfies PageServerLoad

export const actions = {
  default: async ({
    request,
    locals,
  }: {
    request: Request
    locals: { di: { genres: () => Pick<GenresClient, 'createGenre' | 'voteGenreRelevance'> } }
  }) => {
    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const createResult = await locals.di.genres().createGenre(form.data)
    if (createResult.isErr()) {
      switch (createResult.error.name) {
        case 'FetchError': {
          return error(500, createResult.error.message)
        }
        case 'ValidationError': {
          for (const issue of createResult.error.details.issues) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError(form, issue.path as any, issue.message)
          }
          return fail(400, { form })
        }
        case 'DuplicateAkaError': {
          return setError(
            form,
            `${createResult.error.details.level}Akas`,
            createResult.error.message,
          )
        }
        case 'DerivedChildError':
        case 'DerivedInfluenceError': {
          return setError(form, 'derivedFrom._errors', createResult.error.message)
        }
        case 'SelfInfluenceError': {
          return setError(form, 'influencedBy._errors', createResult.error.message)
        }
        case 'UnauthenticatedError':
        case 'UnauthorizedError': {
          return error(createResult.error.statusCode, createResult.error.message)
        }
        default: {
          createResult.error satisfies never
          return error(500, 'An unknown error occurred')
        }
      }
    }

    const relevance = form.data.relevance
    if (relevance !== undefined && relevance !== UNSET_GENRE_RELEVANCE) {
      const voteResult = await locals.di
        .genres()
        .voteGenreRelevance(createResult.value.id, relevance)

      if (voteResult.isErr()) {
        switch (voteResult.error.name) {
          case 'FetchError': {
            return error(500, voteResult.error.message)
          }
          case 'ValidationError': {
            return setError(
              form,
              'relevance',
              voteResult.error.details.issues.map((issue) => issue.message).join(', '),
            )
          }
          case 'UnauthenticatedError':
          case 'UnauthorizedError': {
            return error(voteResult.error.statusCode, voteResult.error.message)
          }
          case 'InvalidGenreRelevanceError': {
            return setError(form, 'relevance', voteResult.error.message)
          }
          default: {
            voteResult.error satisfies never
            return error(500, 'An unknown error occurred')
          }
        }
      }
    }

    redirect(302, `/genres/${createResult.value.id}`)
  },
} satisfies Actions
