import { FetchError } from '@romulus/genres/client'
import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { relevanceVoteSchema } from '$lib/features/genres/components/RelevanceVoteForm'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { countBy } from '$lib/utils/array'
import { isDefined } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const genreResponse = await locals.di.genres().getGenre(id)
  if (genreResponse.isErr()) {
    if (genreResponse.error instanceof FetchError) {
      return error(500, genreResponse.error.message)
    } else {
      return error(genreResponse.error.statusCode, genreResponse.error.message)
    }
  }
  const maybeGenre = genreResponse.value.genre

  const relevanceVotesResponse = await locals.di.genres().getGenreRelevanceVotesByGenre(id)
  if (relevanceVotesResponse.isErr()) {
    if (relevanceVotesResponse.error instanceof FetchError) {
      return error(500, relevanceVotesResponse.error.message)
    } else {
      return error(relevanceVotesResponse.error.statusCode, relevanceVotesResponse.error.message)
    }
  }
  const relevanceVotes = countBy(relevanceVotesResponse.value.votes, (vote) => vote.relevance)

  let relevanceVote = UNSET_GENRE_RELEVANCE
  if (locals.user) {
    const relevanceVoteResponse = await locals.di
      .genres()
      .getGenreRelevanceVoteByAccount(id, locals.user.id)
    if (relevanceVoteResponse.isErr()) {
      if (relevanceVoteResponse.error instanceof FetchError) {
        return error(500, relevanceVoteResponse.error.message)
      } else {
        return error(relevanceVoteResponse.error.statusCode, relevanceVoteResponse.error.message)
      }
    }
    relevanceVote = relevanceVoteResponse.value.vote?.relevance ?? UNSET_GENRE_RELEVANCE
  }

  const usersResponse = await locals.di
    .authentication()
    .getAccounts([...new Set(maybeGenre.contributors)])
  const usersMap = usersResponse.match(
    ({ accounts }) => new Map(accounts.map((user) => [user.id, user])),
    () => new Map<number, { id: number; username: string }>(),
  )

  const { akas, parents, influencedBy, influences, contributors, ...rest } = maybeGenre
  const genre = {
    ...rest,
    akas: [...akas.primary, ...akas.secondary, ...akas.tertiary],
    parents: parents.sort((a, b) => a.name.localeCompare(b.name)),
    influencedBy: influencedBy.sort((a, b) => a.name.localeCompare(b.name)),
    influences: influences.sort((a, b) => a.name.localeCompare(b.name)),
    contributors: contributors.map((id) => usersMap.get(id)).filter(isDefined),
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

    const voteResult = await locals.di.genres().voteGenreRelevance(id, form.data.relevanceVote)
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

    const deleteResult = await locals.di.genres().deleteGenre(id)
    if (deleteResult.isErr()) {
      if (deleteResult.error instanceof FetchError) {
        return error(500, deleteResult.error.message)
      } else {
        return error(deleteResult.error.statusCode, deleteResult.error.message)
      }
    }

    return redirect(302, '/genres')
  },
}
