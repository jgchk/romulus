import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

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

  const genreResponse = await locals.di.genres().queries().getGenre(id)
  if (genreResponse instanceof Error) {
    return error(genreResponse.originalError.statusCode, genreResponse.originalError.message)
  }
  const maybeGenre = genreResponse.genre

  const relevanceVotesResponse = await locals.di
    .genres()
    .queries()
    .getGenreRelevanceVotesByGenre(id)
  if (relevanceVotesResponse instanceof Error) {
    return error(
      relevanceVotesResponse.originalError.statusCode,
      relevanceVotesResponse.originalError.message,
    )
  }
  const relevanceVotes = countBy(relevanceVotesResponse.votes, (vote) => vote.relevance)

  let relevanceVote = UNSET_GENRE_RELEVANCE
  if (locals.user) {
    const relevanceVoteResponse = await locals.di
      .genres()
      .queries()
      .getGenreRelevanceVoteByAccount(id, locals.user.id)
    if (relevanceVoteResponse instanceof Error) {
      return error(
        relevanceVoteResponse.originalError.statusCode,
        relevanceVoteResponse.originalError.message,
      )
    }
    relevanceVote = relevanceVoteResponse.vote?.relevance ?? UNSET_GENRE_RELEVANCE
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
    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const form = await superValidate(request, zod(relevanceVoteSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const voteResult = await locals.di
      .genres()
      .commands()
      .voteGenreRelevance(id, form.data.relevanceVote)
    if (voteResult instanceof Error) {
      return setError(form, 'relevanceVote', voteResult.message)
    }

    return { relevanceVoteForm: form }
  },

  delete: async ({ locals, params }) => {
    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const deleteResult = await locals.di.genres().commands().deleteGenre(id)
    if (deleteResult instanceof Error) {
      return error(deleteResult.originalError.statusCode, deleteResult.message)
    }

    return redirect(302, '/genres')
  },
}
