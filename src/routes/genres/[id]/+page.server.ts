import { type Actions, error, redirect } from '@sveltejs/kit'
import { uniq } from 'ramda'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreParentsDatabase } from '$lib/server/db/controllers/genre-parents'
import { GenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes'
import { createGenreHistoryEntry, setRelevanceVote } from '$lib/server/genres'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { countBy } from '$lib/utils/array'
import { isNotNull } from '$lib/utils/types'

import type { PageServerLoad } from './$types'
import { relevanceVoteSchema } from './utils'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const genresDb = new GenresDatabase(locals.dbConnection)
  const maybeGenre = await genresDb.findByIdDetail(id)
  if (!maybeGenre) {
    return error(404, 'Genre not found')
  }

  const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase(locals.dbConnection)
  const relevanceVotes = await genreRelevanceVotesDb
    .findByGenreId(id)
    .then((votes) => countBy(votes, (vote) => vote.relevance))

  let relevanceVote = UNSET_GENRE_RELEVANCE
  if (locals.user) {
    relevanceVote = await genreRelevanceVotesDb
      .findByGenreIdAndAccountId(id, locals.user.id)
      .then((vote) => vote?.relevance ?? UNSET_GENRE_RELEVANCE)
  }

  const { akas, parents, children, influencedBy, influences, history, ...rest } = maybeGenre
  const genre = {
    ...rest,
    akas: akas.map((aka) => aka.name),
    parents: parents.map((parent) => parent.parent).sort((a, b) => a.name.localeCompare(b.name)),
    children: children.map((child) => child.child).sort((a, b) => a.name.localeCompare(b.name)),
    influencedBy: influencedBy
      .map((influencedBy) => influencedBy.influencer)
      .sort((a, b) => a.name.localeCompare(b.name)),
    influences: influences
      .map((influences) => influences.influenced)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }

  const contributors = uniq(history.map((item) => item.account).filter(isNotNull))

  const relevanceVoteForm = await superValidate({ relevanceVote }, zod(relevanceVoteSchema))

  return { genre, relevanceVotes, relevanceVoteForm, contributors }
}

export const actions: Actions = {
  relevance: async ({ locals, params, request }) => {
    if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
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

    const genresDb = new GenresDatabase(locals.dbConnection)
    const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase(locals.dbConnection)
    await setRelevanceVote(
      id,
      form.data.relevanceVote,
      locals.user.id,
      genresDb,
      genreRelevanceVotesDb,
    )

    return { form }
  },

  delete: async ({ locals, params }) => {
    if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
      return error(401, 'Unauthorized')
    }
    const user = locals.user

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const genresDb = new GenresDatabase(locals.dbConnection)
    const genre = await genresDb.findByIdHistory(id)
    if (!genre) {
      return error(404, 'Genre not found')
    }

    // move child genres under deleted genre's parents
    await locals.dbConnection.transaction(async (tx) => {
      const genresDb = new GenresDatabase(tx)
      const genreParentsDb = new GenreParentsDatabase(tx)
      const genreHistoryDb = new GenreHistoryDatabase(tx)

      await Promise.all(
        genre.children.flatMap(({ childId }) =>
          genre.parents.map(({ parentId }) => genreParentsDb.update(id, childId, { parentId })),
        ),
      )

      await genresDb.deleteById(id)

      await createGenreHistoryEntry({
        genre,
        accountId: user.id,
        operation: 'DELETE',
        genreHistoryDb,
      })

      const relations = [
        ...genre.children.map((c) => c.child),
        ...genre.influences.map((i) => i.influenced),
      ]
      await Promise.all(
        relations.map((genre) =>
          createGenreHistoryEntry({
            genre,
            accountId: user.id,
            operation: 'UPDATE',
            genreHistoryDb,
          }),
        ),
      )
    })

    return redirect(302, '/genres')
  },
}
