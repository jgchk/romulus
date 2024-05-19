import { type Actions, error, redirect } from '@sveltejs/kit'
import { and, asc, desc, eq } from 'drizzle-orm'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { db } from '$lib/server/db'
import { genreAkas, genreParents, genreRelevanceVotes, genres } from '$lib/server/db/schema'
import { createGenreHistoryEntry } from '$lib/server/db/utils'
import { genreRelevance, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { countBy } from '$lib/utils/array'
import { median } from '$lib/utils/math'

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

  const maybeGenre = await db.query.genres.findFirst({
    where: (genres, { eq }) => eq(genres.id, id),
    columns: {
      id: true,
      name: true,
      subtitle: true,
      type: true,
      relevance: true,
      shortDescription: true,
      longDescription: true,
      notes: true,
    },
    with: {
      akas: {
        columns: { name: true },
        orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
      },
      parents: {
        columns: {},
        with: {
          parent: {
            columns: { id: true, name: true, type: true, subtitle: true },
          },
        },
      },
      children: {
        columns: {},
        with: {
          child: {
            columns: { id: true, name: true, type: true },
          },
        },
      },
      influencedBy: {
        columns: {},
        with: {
          influencer: {
            columns: { id: true, name: true, type: true, subtitle: true },
          },
        },
      },
    },
  })

  if (!maybeGenre) {
    return error(404, 'Genre not found')
  }

  const relevanceVotes = await db.query.genreRelevanceVotes
    .findMany({
      where: eq(genreRelevanceVotes.genreId, id),
    })
    .then((votes) => countBy(votes, (vote) => vote.relevance))

  let relevanceVote = UNSET_GENRE_RELEVANCE
  if (locals.user) {
    relevanceVote = await db.query.genreRelevanceVotes
      .findFirst({
        where: and(
          eq(genreRelevanceVotes.genreId, id),
          eq(genreRelevanceVotes.accountId, locals.user.id),
        ),
      })
      .then((vote) => vote?.relevance ?? UNSET_GENRE_RELEVANCE)
  }

  const { akas, parents, children, influencedBy, ...rest } = maybeGenre
  const genre = {
    ...rest,
    akas: akas.map((aka) => aka.name),
    parents: parents.map((parent) => parent.parent).sort((a, b) => a.name.localeCompare(b.name)),
    children: children.map((child) => child.child).sort((a, b) => a.name.localeCompare(b.name)),
    influencedBy: influencedBy
      .map((influencedBy) => influencedBy.influencer)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }

  const relevanceVoteForm = await superValidate({ relevanceVote }, zod(relevanceVoteSchema))

  return { genre, relevanceVotes, relevanceVoteForm }
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

    if (form.data.relevanceVote === UNSET_GENRE_RELEVANCE) {
      await db.delete(genreRelevanceVotes).where(eq(genreRelevanceVotes.genreId, id))
      await updateRelevance(id)
      return { form }
    }

    await db
      .insert(genreRelevanceVotes)
      .values({
        genreId: id,
        accountId: locals.user.id,
        relevance: form.data.relevanceVote,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
        set: {
          relevance: form.data.relevanceVote,
          updatedAt: new Date(),
        },
      })

    await updateRelevance(id)

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

    const genre = await db.query.genres.findFirst({
      where: eq(genres.id, id),
      with: {
        parents: {
          columns: { parentId: true },
        },
        children: {
          columns: { childId: true },
          with: {
            child: {
              with: {
                parents: {
                  columns: { parentId: true },
                },
                children: {
                  columns: { childId: true },
                },
                influencedBy: {
                  columns: {
                    influencerId: true,
                  },
                },
                akas: {
                  columns: {
                    name: true,
                    relevance: true,
                    order: true,
                  },
                },
              },
            },
          },
        },
        influencedBy: {
          columns: {
            influencerId: true,
          },
        },
        influences: {
          with: {
            influenced: {
              with: {
                parents: {
                  columns: { parentId: true },
                },
                children: {
                  columns: { childId: true },
                },
                influencedBy: {
                  columns: {
                    influencerId: true,
                  },
                },
                akas: {
                  columns: {
                    name: true,
                    relevance: true,
                    order: true,
                  },
                },
              },
            },
          },
        },
        akas: {
          columns: {
            name: true,
            relevance: true,
            order: true,
          },
        },
      },
    })

    if (!genre) {
      return error(404, 'Genre not found')
    }

    // move child genres under deleted genre's parents
    await db.transaction(async (tx) => {
      await Promise.all(
        genre.children.flatMap(({ childId }) =>
          genre.parents.map(({ parentId }) =>
            tx
              .update(genreParents)
              .set({ parentId })
              .where(and(eq(genreParents.parentId, id), eq(genreParents.childId, childId))),
          ),
        ),
      )

      await tx.delete(genres).where(eq(genres.id, id))

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

async function updateRelevance(genreId: number) {
  const votes = await db.query.genreRelevanceVotes.findMany({
    where: eq(genreRelevanceVotes.genreId, genreId),
  })

  const relevance =
    votes.length === 0
      ? UNSET_GENRE_RELEVANCE
      : Math.round(median(votes.map((vote) => vote.relevance)))

  await db.update(genres).set({ relevance }).where(eq(genres.id, genreId))
}
