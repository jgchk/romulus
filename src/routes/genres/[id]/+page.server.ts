import { type Actions, error, redirect } from '@sveltejs/kit'
import { uniq } from 'ramda'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { db } from '$lib/server/db'
import { createGenreHistoryEntry } from '$lib/server/db/utils'
import { setRelevanceVote } from '$lib/server/genres'
import { genreRelevance, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { countBy } from '$lib/utils/array'
import { isNotNull } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

const relevanceVoteSchema = z.object({
  relevanceVote: genreRelevance,
})

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const maybeGenre = await db.genres.findByIdDetail(id)
  if (!maybeGenre) {
    return error(404, 'Genre not found')
  }

  const relevanceVotes = await db.genreRelevanceVotes
    .findByGenreId(id)
    .then((votes) => countBy(votes, (vote) => vote.relevance))

  let relevanceVote = UNSET_GENRE_RELEVANCE
  if (locals.user) {
    relevanceVote = await db.genreRelevanceVotes
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

    await setRelevanceVote(id, form.data.relevanceVote, locals.user.id)

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

    const genre = await db.genres.findByIdHistory(id)
    if (!genre) {
      return error(404, 'Genre not found')
    }

    // move child genres under deleted genre's parents
    await db.transaction(async (tx) => {
      await Promise.all(
        genre.children.flatMap(({ childId }) =>
          genre.parents.map(({ parentId }) => tx.genreParents.update(id, childId, { parentId })),
        ),
      )

      await tx.genres.deleteById(id)

      await createGenreHistoryEntry({ genre, accountId: user.id, operation: 'DELETE', db: tx })

      const relations = [
        ...genre.children.map((c) => c.child),
        ...genre.influences.map((i) => i.influenced),
      ]
      await Promise.all(
        relations.map((genre) =>
          createGenreHistoryEntry({ genre, accountId: user.id, operation: 'UPDATE', db: tx }),
        ),
      )
    })

    return redirect(302, '/genres')
  },
}
