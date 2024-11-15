import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { GenreNotFoundError } from '$lib/server/features/genres/commands/application/errors/genre-not-found'
import { InvalidGenreRelevanceError } from '$lib/server/features/genres/commands/domain/errors/invalid-genre-relevance'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { countBy } from '$lib/utils/array'

import type { PageServerLoad } from './$types'
import { relevanceVoteSchema } from './utils'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const maybeGenre = await locals.services.genre.queries.getGenre(id)
  if (!maybeGenre) {
    return error(404, 'Genre not found')
  }

  const relevanceVotes = await locals.services.genre.queries
    .getGenreRelevanceVotesByGenre(id)
    .then((votes) => countBy(votes, (vote) => vote.relevance))

  let relevanceVote = UNSET_GENRE_RELEVANCE
  if (locals.user) {
    relevanceVote = await locals.services.genre.queries
      .getGenreRelevanceVoteByAccount(id, locals.user.id)
      .then((vote) => vote?.relevance ?? UNSET_GENRE_RELEVANCE)
  }

  const { akas, parents, children, influencedBy, influences, ...rest } = maybeGenre
  const genre = {
    ...rest,
    akas: [...akas.primary, ...akas.secondary, ...akas.tertiary],
    parents: parents.sort((a, b) => a.name.localeCompare(b.name)),
    children: children.sort((a, b) => a.name.localeCompare(b.name)),
    influencedBy: influencedBy.sort((a, b) => a.name.localeCompare(b.name)),
    influences: influences.sort((a, b) => a.name.localeCompare(b.name)),
  }

  const relevanceVoteForm = await superValidate({ relevanceVote }, zod(relevanceVoteSchema))

  return { genre, relevanceVotes, relevanceVoteForm }
}

export const actions: Actions = {
  relevance: async ({ locals, params, request }) => {
    if (!locals.user?.permissions?.includes('EDIT_GENRES')) {
      return error(401, 'Unauthorized')
    }

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const form = await superValidate(request, zod(relevanceVoteSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const voteResult = await locals.services.genre.commands.voteGenreRelevance(
      id,
      form.data.relevanceVote,
      locals.user.id,
    )
    if (voteResult instanceof InvalidGenreRelevanceError) {
      return setError(form, 'relevanceVote', voteResult.message)
    }

    return { relevanceVoteForm: form }
  },

  delete: async ({ locals, params }) => {
    if (!locals.user?.permissions?.includes('EDIT_GENRES')) {
      return error(401, 'Unauthorized')
    }
    const user = locals.user

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const deleteResult = await locals.services.genre.commands.deleteGenre(id, user.id)
    if (deleteResult instanceof GenreNotFoundError) {
      return error(404, 'Genre not found')
    }

    return redirect(302, '/genres')
  },
}
